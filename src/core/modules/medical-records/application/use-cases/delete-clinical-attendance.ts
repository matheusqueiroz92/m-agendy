import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { ClinicalAttendanceRepository } from "../ports/clinical-attendance-repository";

export interface DeleteClinicalAttendanceInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  attendanceId: string;
}

/** Remove um atendimento, validando isolamento por clínica e auditando. */
export class DeleteClinicalAttendanceUseCase {
  constructor(
    private readonly attendances: ClinicalAttendanceRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(input: DeleteClinicalAttendanceInput): Promise<void> {
    this.authorizer.assertCanAccessClinicalData(input.actor, input.clinicId);

    const existing = await this.attendances.findById(input.attendanceId);
    if (!existing || existing.clinicId !== input.clinicId) {
      throw new NotFoundError("Atendimento não encontrado.");
    }

    await this.attendances.delete(input.attendanceId);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: "attendance.deleted",
      entityType: "attendance",
      entityId: input.attendanceId,
    });
  }
}
