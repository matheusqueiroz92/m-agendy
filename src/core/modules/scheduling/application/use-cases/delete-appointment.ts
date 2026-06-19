import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { AppointmentRepository } from "../ports/appointment-repository";
import { ReminderScheduler } from "../ports/reminder-scheduler";

export interface DeleteAppointmentInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  appointmentId: string;
}

/**
 * Remove um agendamento. Exige papel de gestão, valida isolamento por clínica,
 * cancela lembretes pendentes (best-effort) e registra auditoria.
 */
export class DeleteAppointmentUseCase {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
    private readonly reminders: ReminderScheduler,
  ) {}

  async execute(input: DeleteAppointmentInput): Promise<void> {
    this.authorizer.assertCanManageClinic(input.actor, input.clinicId);

    const existing = await this.appointments.findById(input.appointmentId);
    if (!existing || existing.clinicId !== input.clinicId) {
      throw new NotFoundError("Agendamento não encontrado.");
    }

    await this.appointments.delete(input.appointmentId);

    try {
      await this.reminders.cancelForAppointment(input.appointmentId);
    } catch (error) {
      console.error("[scheduling] falha ao cancelar lembretes:", error);
    }

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: "appointment.deleted",
      entityType: "appointment",
      entityId: input.appointmentId,
    });
  }
}
