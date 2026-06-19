import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { Clock } from "@/core/shared/application/ports/clock";
import { NotFoundError, PlanLimitError } from "@/core/shared/domain/errors";
import { canCreateAppointment } from "@/core/modules/billing/domain/entitlements";

import { Appointment } from "../../domain/appointment";
import {
  AppointmentConflictError,
  AppointmentInThePastError,
} from "../../domain/errors";
import { computeReminderTimes } from "../../domain/reminder-policy";
import { AppointmentContactDirectory } from "../ports/appointment-contact-directory";
import { AppointmentNotifier } from "../ports/appointment-notifier";
import { AppointmentRepository } from "../ports/appointment-repository";
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
  priceInCents: number;
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
  ) {}

  async execute(
    input: UpsertAppointmentInput,
  ): Promise<UpsertAppointmentOutput> {
    this.authorizer.assertCanManageClinic(input.actor, input.clinicId);

    const now = this.clock.now();

    if (input.scheduledAt.getTime() <= now.getTime()) {
      throw new AppointmentInThePastError();
    }

    if (input.id) {
      const existing = await this.appointments.findById(input.id);
      if (!existing || existing.clinicId !== input.clinicId) {
        throw new NotFoundError("Agendamento não encontrado.");
      }
    } else if (input.plan) {
      // Criação: respeita o limite de agendamentos/mês do plano. A janela é o
      // mês (UTC) da data agendada.
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
    }

    const hasConflict = await this.appointments.hasConflict({
      clinicId: input.clinicId,
      doctorId: input.doctorId,
      scheduledAt: input.scheduledAt,
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
      priceInCents: input.priceInCents,
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
          to: contact.patientPhoneNumber,
          patientName: contact.patientName,
          scheduledAt: appointment.scheduledAt,
          doctorName: contact.doctorName ?? undefined,
        });

        for (const runAt of computeReminderTimes(appointment.scheduledAt, now)) {
          await this.reminders.schedule({
            appointmentId: appointment.id,
            runAt,
            to: contact.patientPhoneNumber,
            patientName: contact.patientName,
            doctorName: contact.doctorName ?? undefined,
            scheduledAt: appointment.scheduledAt,
          });
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
