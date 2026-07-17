import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { AppointmentContactDirectory } from "../ports/appointment-contact-directory";
import { AppointmentNotifier } from "../ports/appointment-notifier";
import { AppointmentRepository } from "../ports/appointment-repository";
import { ReminderScheduler } from "../ports/reminder-scheduler";

export interface CancelAppointmentInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  appointmentId: string;
}

/**
 * Cancela um agendamento. Exige papel de gestão, valida isolamento por
 * clínica, cancela lembretes pendentes e avisa o paciente por WhatsApp
 * (ambos best-effort) e registra auditoria.
 *
 * Diferente de um DELETE: o registro é preservado com `status: "cancelled"`
 * (soft delete) em vez de removido — mantém histórico para auditoria e para
 * futuras métricas de cancelamento/falta.
 */
export class CancelAppointmentUseCase {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
    private readonly reminders: ReminderScheduler,
    private readonly notifier: AppointmentNotifier,
    private readonly contacts: AppointmentContactDirectory,
  ) {}

  async execute(input: CancelAppointmentInput): Promise<void> {
    this.authorizer.assertCanManageClinic(input.actor, input.clinicId);

    const existing = await this.appointments.findById(input.appointmentId);
    if (!existing || existing.clinicId !== input.clinicId) {
      throw new NotFoundError("Agendamento não encontrado.");
    }

    await this.appointments.updateStatus(input.appointmentId, "cancelled");

    // Lembretes/aviso não devem impedir o cancelamento em si.
    try {
      await this.reminders.cancelForAppointment(input.appointmentId);

      const contact = await this.contacts.getContact({
        clinicId: input.clinicId,
        patientId: existing.patientId,
        doctorId: existing.doctorId,
      });

      if (contact?.patientPhoneNumber) {
        await this.notifier.notifyCancelled({
          clinicId: input.clinicId,
          to: contact.patientPhoneNumber,
          patientName: contact.patientName,
          scheduledAt: existing.scheduledAt,
          doctorName: contact.doctorName ?? undefined,
        });
      }
    } catch (error) {
      console.error(
        "[scheduling] falha ao cancelar lembretes/notificar paciente:",
        error,
      );
    }

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: "appointment.cancelled",
      entityType: "appointment",
      entityId: input.appointmentId,
    });
  }
}
