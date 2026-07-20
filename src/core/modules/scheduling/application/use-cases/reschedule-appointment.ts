import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { Clock } from "@/core/shared/application/ports/clock";
import { NotFoundError } from "@/core/shared/domain/errors";

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
import { ReminderScheduler } from "../ports/reminder-scheduler";

export interface RescheduleAppointmentInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  appointmentId: string;
  scheduledAt: Date;
  durationInMinutes: number;
}

export interface RescheduleAppointmentOutput {
  appointmentId: string;
}

/**
 * Move ou redimensiona um agendamento no quadro (drag/resize).
 */
export class RescheduleAppointmentUseCase {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
    private readonly clock: Clock,
    private readonly reminders: ReminderScheduler,
    private readonly notifier: AppointmentNotifier,
    private readonly contacts: AppointmentContactDirectory,
    private readonly availability: AvailabilityReader,
  ) {}

  async execute(
    input: RescheduleAppointmentInput,
  ): Promise<RescheduleAppointmentOutput> {
    this.authorizer.assertCanManageClinic(input.actor, input.clinicId);

    const existing = await this.appointments.findById(input.appointmentId);
    if (!existing || existing.clinicId !== input.clinicId) {
      throw new NotFoundError("Agendamento não encontrado.");
    }

    if (
      existing.status === "cancelled" ||
      existing.status === "no_show"
    ) {
      throw new NotFoundError("Agendamento não encontrado.");
    }

    const now = this.clock.now();
    if (input.scheduledAt.getTime() <= now.getTime()) {
      throw new AppointmentInThePastError();
    }

    const availabilityInfo = await this.availability.getAvailability({
      clinicId: input.clinicId,
      doctorId: existing.doctorId,
    });

    if (!availabilityInfo) {
      throw new NotFoundError("Profissional não encontrado.");
    }

    if (
      !isWithinAvailability(
        input.scheduledAt,
        input.durationInMinutes,
        availabilityInfo.windows,
      )
    ) {
      throw new AppointmentOutsideAvailabilityError();
    }

    const hasConflict = await this.appointments.hasConflict({
      clinicId: input.clinicId,
      doctorId: existing.doctorId,
      scheduledAt: input.scheduledAt,
      durationInMinutes: input.durationInMinutes,
      excludeAppointmentId: existing.id,
    });

    if (hasConflict) {
      throw new AppointmentConflictError();
    }

    const appointment = existing.withSchedule(
      input.scheduledAt,
      input.durationInMinutes,
    );

    await this.appointments.save(appointment);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: "appointment.rescheduled",
      entityType: "appointment",
      entityId: appointment.id,
    });

    try {
      await this.reminders.cancelForAppointment(appointment.id);

      const contact = await this.contacts.getContact({
        clinicId: input.clinicId,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
      });

      if (contact?.patientPhoneNumber) {
        await this.notifier.notifyScheduled({
          clinicId: input.clinicId,
          to: contact.patientPhoneNumber,
          patientName: contact.patientName,
          scheduledAt: appointment.scheduledAt,
          doctorName: contact.doctorName ?? undefined,
        });

        for (const runAt of computeReminderTimes(appointment.scheduledAt, now)) {
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
    } catch (error) {
      console.error(
        "[scheduling] falha ao notificar/agendar lembretes (reschedule):",
        error,
      );
    }

    return { appointmentId: appointment.id };
  }
}
