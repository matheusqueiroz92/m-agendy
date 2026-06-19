import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { PatientRepository } from "../ports/patient-repository";

export interface DeletePatientInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  patientId: string;
}

/**
 * Remove um paciente. Exige papel de gestão na clínica, valida o isolamento por
 * clínica e registra auditoria.
 */
export class DeletePatientUseCase {
  constructor(
    private readonly patients: PatientRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(input: DeletePatientInput): Promise<void> {
    this.authorizer.assertCanManageClinic(input.actor, input.clinicId);

    const existing = await this.patients.findById(input.patientId);
    if (!existing || existing.clinicId !== input.clinicId) {
      throw new NotFoundError("Paciente não encontrado.");
    }

    await this.patients.delete(input.patientId);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: "patient.deleted",
      entityType: "patient",
      entityId: input.patientId,
    });
  }
}
