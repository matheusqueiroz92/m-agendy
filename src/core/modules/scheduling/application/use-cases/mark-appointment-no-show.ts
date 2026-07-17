import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { AppointmentRepository } from "../ports/appointment-repository";

export interface MarkAppointmentNoShowInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  appointmentId: string;
}

/**
 * Marca um agendamento como falta (`no_show`). Exige papel de gestão, valida
 * isolamento por clínica e registra auditoria — mesmo padrão de
 * `CancelAppointmentUseCase`, mas sem cancelar lembretes (a consulta já
 * passou; não há lembrete pendente a cancelar) nem remover o registro (falta
 * é histórico, não exclusão).
 */
export class MarkAppointmentNoShowUseCase {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(input: MarkAppointmentNoShowInput): Promise<void> {
    this.authorizer.assertCanManageClinic(input.actor, input.clinicId);

    const existing = await this.appointments.findById(input.appointmentId);
    if (!existing || existing.clinicId !== input.clinicId) {
      throw new NotFoundError("Agendamento não encontrado.");
    }

    await this.appointments.updateStatus(input.appointmentId, "no_show");

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: "appointment.no_show",
      entityType: "appointment",
      entityId: input.appointmentId,
    });
  }
}
