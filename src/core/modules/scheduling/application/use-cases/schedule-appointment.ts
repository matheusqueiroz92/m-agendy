import { canCreateAppointment } from "@/core/modules/billing/domain/entitlements";
import { Clock } from "@/core/shared/application/ports/clock";
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
import { ClinicPlanProvider } from "../ports/clinic-plan-provider";
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
    }

    const hasConflict = await this.appointments.hasConflict({
      clinicId: input.clinicId,
      doctorId: input.doctorId,
      scheduledAt: input.scheduledAt,
    });

    if (hasConflict) {
      throw new AppointmentConflictError();
    }

    const appointment = Appointment.create({
      clinicId: input.clinicId,
      patientId: input.patientId,
      doctorId: input.doctorId,
      scheduledAt: input.scheduledAt,
      priceInCents: input.priceInCents,
    });

    await this.appointments.save(appointment);

    // Sem telefone não há como notificar/lembrar por WhatsApp.
    if (input.patientPhoneNumber) {
      const patientName = input.patientName ?? "";

      // Confirmação imediata ("best-effort": não desfaz o agendamento).
      try {
        await this.notifier.notifyScheduled({
          to: input.patientPhoneNumber,
          patientName,
          scheduledAt: appointment.scheduledAt,
          doctorName: input.doctorName,
        });
      } catch {
        // TODO: logar/observabilidade; não propagar.
      }

      // Agenda os lembretes futuros (24h e 2h antes, por padrão).
      const reminderTimes = computeReminderTimes(appointment.scheduledAt, now);
      for (const runAt of reminderTimes) {
        await this.reminders.schedule({
          appointmentId: appointment.id,
          runAt,
          to: input.patientPhoneNumber,
          patientName,
          doctorName: input.doctorName,
          scheduledAt: appointment.scheduledAt,
        });
      }
    }

    return { appointmentId: appointment.id };
  }
}
