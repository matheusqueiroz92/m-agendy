import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { PrescriptionRepository } from "../ports/prescription-repository";

export interface DeletePrescriptionInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  prescriptionId: string;
}

/** Remove uma prescrição, validando isolamento por clínica e auditando. */
export class DeletePrescriptionUseCase {
  constructor(
    private readonly prescriptions: PrescriptionRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(input: DeletePrescriptionInput): Promise<void> {
    this.authorizer.assertCanAccessClinicalData(input.actor, input.clinicId);

    const existing = await this.prescriptions.findById(input.prescriptionId);
    if (!existing || existing.clinicId !== input.clinicId) {
      throw new NotFoundError("Prescrição não encontrada.");
    }

    await this.prescriptions.delete(input.prescriptionId);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: "prescription.deleted",
      entityType: "prescription",
      entityId: input.prescriptionId,
    });
  }
}
