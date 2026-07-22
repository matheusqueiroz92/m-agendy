import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { Clock } from "@/core/shared/application/ports/clock";
import { NotFoundError, PlanLimitError } from "@/core/shared/domain/errors";
import { dayWindowInClinicTimezone } from "@/core/shared/domain/combine-date-and-time";
import {
  canCreateAppointment,
  canCreateAppointmentToday,
  entitlementsOf,
  isOneAppointmentAwayFromDailyLimit,
} from "@/core/modules/billing/domain/entitlements";

import { Appointment, AppointmentType } from "../../domain/appointment";
import {
  AppointmentConflictError,
  AppointmentInThePastError,
  AppointmentOutsideAvailabilityError,
} from "../../domain/errors";
import { isWithinAvailability } from "../../domain/availability";
import { computeReminderTimes } from "../../domain/reminder-policy";
import { AppointmentContactDirectory } from "../ports/appointment-contact-directory";
import { AppointmentNotifier } from "../ports/appointment-notifier";
import { AppointmentRepository } from "../ports/appointment-repository";
import { AvailabilityReader } from "../ports/availability-reader";
import { ClinicNotifier } from "../ports/clinic-notifier";
import { ClinicReminderPreference } from "../ports/clinic-reminder-preference";
import { ReminderScheduler } from "../ports/reminder-scheduler";

export interface UpsertAppointmentInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  /** Plano efetivo da clínica (para aplicar o limite mensal). */
  plan?: string | null;
  id?: string;
  patientId: string;
  doctorId: string;
  scheduledAt: Date;
  durationInMinutes?: number;
  priceInCents: number;
  /** Consulta (padrão) ou retorno. */
  type?: AppointmentType;
}

export interface UpsertAppointmentOutput {
  appointmentId: string;
}

/**
 * Cria ou atualiza um agendamento pela equipe da clínica (painel).
 * Exige papel de gestão, garante isolamento por clínica, valida data futura e
 * conflito de horário, registra auditoria e — de forma "best-effort" — envia a
 * confirmação por WhatsApp e agenda os lembretes (reagendando na edição).
 */
export class UpsertAppointmentUseCase {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
    private readonly clock: Clock,
    private readonly reminders: ReminderScheduler,
    private readonly notifier: AppointmentNotifier,
    private readonly contacts: AppointmentContactDirectory,
    private readonly availability: AvailabilityReader,
    private readonly clinicNotifier: ClinicNotifier,
    private readonly reminderPreference: ClinicReminderPreference,
  ) {}

  async execute(
    input: UpsertAppointmentInput,
  ): Promise<UpsertAppointmentOutput> {
    this.authorizer.assertCanManageClinic(input.actor, input.clinicId);

    const now = this.clock.now();

    if (input.scheduledAt.getTime() <= now.getTime()) {
      throw new AppointmentInThePastError();
    }

    let dayCountBeforeCreate: number | null = null;

    if (input.id) {
      const existing = await this.appointments.findById(input.id);
      if (!existing || existing.clinicId !== input.clinicId) {
        throw new NotFoundError("Agendamento não encontrado.");
      }
    } else if (input.plan) {
      const y = input.scheduledAt.getUTCFullYear();
      const m = input.scheduledAt.getUTCMonth();
      const start = new Date(Date.UTC(y, m, 1));
      const end = new Date(Date.UTC(y, m + 1, 1));
      const monthCount = await this.appointments.countByClinicInPeriod(
        input.clinicId,
        start,
        end,
      );
      if (!canCreateAppointment(input.plan, monthCount)) {
        throw new PlanLimitError(
          "Seu plano atingiu o limite de agendamentos deste mês. Faça upgrade para criar mais.",
        );
      }

      // Limite diário (controle de volume de mensagens de WhatsApp) — conta
      // por data de CRIAÇÃO, não pela data agendada.
      const { start: dayStart, end: dayEnd } = dayWindowInClinicTimezone(now);
      dayCountBeforeCreate = await this.appointments.countCreatedByClinicInPeriod(
        input.clinicId,
        dayStart,
        dayEnd,
      );
      if (!canCreateAppointmentToday(input.plan, dayCountBeforeCreate)) {
        throw new PlanLimitError(
          "Sua clínica atingiu o limite diário de agendamentos do plano. Tente novamente amanhã ou faça upgrade.",
        );
      }
    }

    const availabilityInfo = await this.availability.getAvailability({
      clinicId: input.clinicId,
      doctorId: input.doctorId,
    });

    if (!availabilityInfo) {
      throw new NotFoundError("Profissional não encontrado.");
    }

    const durationInMinutes =
      input.durationInMinutes ??
      availabilityInfo.defaultAppointmentDurationInMinutes;

    if (
      !isWithinAvailability(
        input.scheduledAt,
        durationInMinutes,
        availabilityInfo.windows,
      )
    ) {
      throw new AppointmentOutsideAvailabilityError();
    }

    const hasConflict = await this.appointments.hasConflict({
      clinicId: input.clinicId,
      doctorId: input.doctorId,
      scheduledAt: input.scheduledAt,
      durationInMinutes,
      excludeAppointmentId: input.id,
    });

    if (hasConflict) {
      throw new AppointmentConflictError();
    }

    const appointment = Appointment.create({
      id: input.id,
      clinicId: input.clinicId,
      patientId: input.patientId,
      doctorId: input.doctorId,
      scheduledAt: input.scheduledAt,
      durationInMinutes,
      priceInCents: input.priceInCents,
      type: input.type,
    });

    await this.appointments.save(appointment);

    const isUpdate = Boolean(input.id);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: isUpdate ? "appointment.updated" : "appointment.created",
      entityType: "appointment",
      entityId: appointment.id,
    });

    // Aviso de proximidade do limite diário (best-effort, não derruba o
    // agendamento). dayCountBeforeCreate só é calculado na criação (não na
    // edição) — dayCountBeforeCreate + 1 é a contagem já incluindo este.
    if (!isUpdate && input.plan && dayCountBeforeCreate !== null) {
      const limit = entitlementsOf(input.plan).maxAppointmentsPerDay;
      if (
        limit !== null &&
        isOneAppointmentAwayFromDailyLimit(input.plan, dayCountBeforeCreate + 1)
      ) {
        try {
          await this.clinicNotifier.notifyDailyLimitWarning({
            clinicId: input.clinicId,
            limit,
          });
        } catch (error) {
          console.error("[scheduling] falha ao avisar limite diário:", error);
        }
      }
    }

    // Confirmação + lembretes não devem derrubar o agendamento.
    try {
      if (isUpdate) {
        await this.reminders.cancelForAppointment(appointment.id);
      }

      const contact = await this.contacts.getContact({
        clinicId: input.clinicId,
        patientId: input.patientId,
        doctorId: input.doctorId,
      });

      if (contact?.patientPhoneNumber) {
        await this.notifier.notifyScheduled({
          clinicId: input.clinicId,
          to: contact.patientPhoneNumber,
          patientName: contact.patientName,
          scheduledAt: appointment.scheduledAt,
          doctorName: contact.doctorName ?? undefined,
        });

        const remindersEnabled =
          await this.reminderPreference.areRemindersEnabled(input.clinicId);
        if (remindersEnabled) {
          for (const runAt of computeReminderTimes(
            appointment.scheduledAt,
            now,
          )) {
            await this.reminders.schedule({
              appointmentId: appointment.id,
              clinicId: input.clinicId,
              runAt,
              to: contact.patientPhoneNumber,
              patientName: contact.patientName,
              doctorName: contact.doctorName ?? undefined,
              scheduledAt: appointment.scheduledAt,
            });
          }
        }
      }
    } catch (error) {
      console.error(
        "[scheduling] falha ao notificar/agendar lembretes:",
        error,
      );
    }

    return { appointmentId: appointment.id };
  }
}
