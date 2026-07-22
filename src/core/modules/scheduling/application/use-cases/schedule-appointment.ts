import {
  canCreateAppointment,
  canCreateAppointmentToday,
  entitlementsOf,
  isOneAppointmentAwayFromDailyLimit,
} from "@/core/modules/billing/domain/entitlements";
import { Clock } from "@/core/shared/application/ports/clock";
import { dayWindowInClinicTimezone } from "@/core/shared/domain/combine-date-and-time";
import { PlanLimitError } from "@/core/shared/domain/errors";

import { Appointment } from "../../domain/appointment";
import {
  AppointmentConflictError,
  AppointmentInThePastError,
} from "../../domain/errors";
import { monthWindowUTC } from "../../domain/month-window";
import { computeReminderTimes } from "../../domain/reminder-policy";
import { AppointmentNotifier } from "../ports/appointment-notifier";
import { AppointmentRepository } from "../ports/appointment-repository";
import { ClinicNotifier } from "../ports/clinic-notifier";
import { ClinicPlanProvider } from "../ports/clinic-plan-provider";
import { ClinicReminderPreference } from "../ports/clinic-reminder-preference";
import { ReminderScheduler } from "../ports/reminder-scheduler";

export interface ScheduleAppointmentInput {
  clinicId: string;
  patientId: string;
  doctorId: string;
  scheduledAt: Date;
  priceInCents: number;
  /** Dados usados apenas para a notificação/lembrete (opcionais). */
  patientName?: string;
  patientPhoneNumber?: string;
  doctorName?: string;
}

export interface ScheduleAppointmentOutput {
  appointmentId: string;
}

/**
 * Caso de uso: agendar uma consulta.
 *
 * Orquestra o domínio e as portas. Não sabe se está sendo chamado por uma
 * Server Action, um webhook do WhatsApp ou uma futura API Fastify — recebe
 * dependências por injeção (SOLID/DIP) e é 100% testável sem infraestrutura.
 */
export class ScheduleAppointmentUseCase {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly notifier: AppointmentNotifier,
    private readonly reminders: ReminderScheduler,
    private readonly clock: Clock,
    private readonly plans: ClinicPlanProvider,
    private readonly clinicNotifier: ClinicNotifier,
    private readonly reminderPreference: ClinicReminderPreference,
  ) {}

  async execute(
    input: ScheduleAppointmentInput,
  ): Promise<ScheduleAppointmentOutput> {
    const now = this.clock.now();

    if (input.scheduledAt.getTime() <= now.getTime()) {
      throw new AppointmentInThePastError();
    }

    // Limite mensal do plano (vale também para o link público e o chatbot).
    const plan = await this.plans.getEffectivePlan(input.clinicId);
    let dayCountBeforeCreate: number | null = null;
    if (plan) {
      const { start, end } = monthWindowUTC(input.scheduledAt);
      const monthCount = await this.appointments.countByClinicInPeriod(
        input.clinicId,
        start,
        end,
      );
      if (!canCreateAppointment(plan, monthCount)) {
        throw new PlanLimitError(
          "O limite de agendamentos do plano desta clínica foi atingido neste mês.",
        );
      }

      // Limite diário (controle de volume de mensagens de WhatsApp) — conta
      // por data de CRIAÇÃO, não pela data agendada. Vale também para o link
      // público e o chatbot, que reaproveitam este caso de uso.
      const { start: dayStart, end: dayEnd } = dayWindowInClinicTimezone(now);
      dayCountBeforeCreate = await this.appointments.countCreatedByClinicInPeriod(
        input.clinicId,
        dayStart,
        dayEnd,
      );
      if (!canCreateAppointmentToday(plan, dayCountBeforeCreate)) {
        throw new PlanLimitError(
          "O limite diário de agendamentos do plano desta clínica foi atingido. Tente novamente amanhã.",
        );
      }
    }

    const hasConflict = await this.appointments.hasConflict({
      clinicId: input.clinicId,
      doctorId: input.doctorId,
      scheduledAt: input.scheduledAt,
      durationInMinutes: 30,
    });

    if (hasConflict) {
      throw new AppointmentConflictError();
    }

    const appointment = Appointment.create({
      clinicId: input.clinicId,
      patientId: input.patientId,
      doctorId: input.doctorId,
      scheduledAt: input.scheduledAt,
      durationInMinutes: 30,
      priceInCents: input.priceInCents,
    });

    await this.appointments.save(appointment);

    // Aviso de proximidade do limite diário (best-effort).
    if (plan && dayCountBeforeCreate !== null) {
      const limit = entitlementsOf(plan).maxAppointmentsPerDay;
      if (
        limit !== null &&
        isOneAppointmentAwayFromDailyLimit(plan, dayCountBeforeCreate + 1)
      ) {
        try {
          await this.clinicNotifier.notifyDailyLimitWarning({
            clinicId: input.clinicId,
            limit,
          });
        } catch (error) {
          console.error(
            "[scheduling] falha ao avisar limite diário (schedule):",
            error,
          );
        }
      }
    }

    // Sem telefone não há como notificar/lembrar por WhatsApp.
    if (input.patientPhoneNumber) {
      const patientName = input.patientName ?? "";

      // Confirmação imediata ("best-effort": não desfaz o agendamento).
      try {
        await this.notifier.notifyScheduled({
          clinicId: input.clinicId,
          to: input.patientPhoneNumber,
          patientName,
          scheduledAt: appointment.scheduledAt,
          doctorName: input.doctorName,
        });
      } catch {
        // TODO: logar/observabilidade; não propagar.
      }

      // Agenda os lembretes futuros (24h e 2h antes, por padrão) — a menos
      // que a clínica tenha desativado o toggle "Lembretes de Agendamento".
      const remindersEnabled = await this.reminderPreference.areRemindersEnabled(
        input.clinicId,
      );
      if (remindersEnabled) {
        const reminderTimes = computeReminderTimes(appointment.scheduledAt, now);
        for (const runAt of reminderTimes) {
          await this.reminders.schedule({
            appointmentId: appointment.id,
            clinicId: input.clinicId,
            runAt,
            to: input.patientPhoneNumber,
            patientName,
            doctorName: input.doctorName,
            scheduledAt: appointment.scheduledAt,
          });
        }
      }
    }

    return { appointmentId: appointment.id };
  }
}
