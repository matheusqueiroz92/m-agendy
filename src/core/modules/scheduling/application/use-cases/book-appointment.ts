import { canCreateAppointment } from "@/core/modules/billing/domain/entitlements";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { Clock } from "@/core/shared/application/ports/clock";
import { NotFoundError, PlanLimitError } from "@/core/shared/domain/errors";

import { Appointment } from "../../domain/appointment";
import {
  AppointmentConflictError,
  AppointmentInThePastError,
} from "../../domain/errors";
import { monthWindowUTC } from "../../domain/month-window";
import { computeReminderTimes } from "../../domain/reminder-policy";
import { AppointmentNotifier } from "../ports/appointment-notifier";
import { AppointmentRepository } from "../ports/appointment-repository";
import { BookingDirectory } from "../ports/booking-directory";
import { ClinicPlanProvider } from "../ports/clinic-plan-provider";
import { ReminderScheduler } from "../ports/reminder-scheduler";

export interface BookAppointmentInput {
  clinicId: string;
  doctorId: string;
  scheduledAt: Date;
  patientName: string;
  patientEmail: string;
  patientPhoneNumber: string;
  patientSex: "male" | "female";
}

export interface BookAppointmentOutput {
  appointmentId: string;
}

/**
 * Agendamento online feito pelo próprio paciente (link público da clínica).
 *
 * Não há ator autenticado: a autorização é "pública por clínica". O preço vem
 * do profissional, o paciente é casado/criado por e-mail ou telefone, valida-se
 * data futura e conflito, e dispara confirmação + lembretes (best-effort).
 */
export class BookAppointmentUseCase {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly booking: BookingDirectory,
    private readonly reminders: ReminderScheduler,
    private readonly notifier: AppointmentNotifier,
    private readonly audit: AuditLog,
    private readonly clock: Clock,
    private readonly plans: ClinicPlanProvider,
  ) {}

  async execute(input: BookAppointmentInput): Promise<BookAppointmentOutput> {
    const now = this.clock.now();

    if (input.scheduledAt.getTime() <= now.getTime()) {
      throw new AppointmentInThePastError();
    }

    // Limite mensal do plano (agendamento público pelo paciente).
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

    const professional = await this.booking.getProfessional({
      clinicId: input.clinicId,
      doctorId: input.doctorId,
    });

    if (!professional) {
      throw new NotFoundError("Profissional não encontrado.");
    }

    const hasConflict = await this.appointments.hasConflict({
      clinicId: input.clinicId,
      doctorId: input.doctorId,
      scheduledAt: input.scheduledAt,
    });

    if (hasConflict) {
      throw new AppointmentConflictError();
    }

    const patientId = await this.booking.findOrCreatePatient({
      clinicId: input.clinicId,
      name: input.patientName,
      email: input.patientEmail,
      phoneNumber: input.patientPhoneNumber,
      sex: input.patientSex,
    });

    const appointment = Appointment.create({
      clinicId: input.clinicId,
      patientId,
      doctorId: input.doctorId,
      scheduledAt: input.scheduledAt,
      priceInCents: professional.priceInCents,
    });

    await this.appointments.save(appointment);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: null,
      action: "appointment.booked_online",
      entityType: "appointment",
      entityId: appointment.id,
      metadata: { patientId, channel: "public_link" },
    });

    // Confirmação + lembretes não devem derrubar o agendamento.
    try {
      await this.notifier.notifyScheduled({
        clinicId: input.clinicId,
        to: input.patientPhoneNumber,
        patientName: input.patientName,
        scheduledAt: appointment.scheduledAt,
        doctorName: professional.name,
      });

      for (const runAt of computeReminderTimes(appointment.scheduledAt, now)) {
        await this.reminders.schedule({
          appointmentId: appointment.id,
          clinicId: input.clinicId,
          runAt,
          to: input.patientPhoneNumber,
          patientName: input.patientName,
          doctorName: professional.name,
          scheduledAt: appointment.scheduledAt,
        });
      }
    } catch (error) {
      console.error(
        "[scheduling] falha ao notificar/agendar lembretes (booking):",
        error,
      );
    }

    return { appointmentId: appointment.id };
  }
}
