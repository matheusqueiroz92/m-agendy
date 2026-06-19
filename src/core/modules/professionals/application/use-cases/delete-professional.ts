import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { ProfessionalRepository } from "../ports/professional-repository";

export interface DeleteProfessionalInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  professionalId: string;
}

/**
 * Remove um profissional. Exige papel de gestão na clínica, valida isolamento
 * por clínica e registra auditoria.
 */
export class DeleteProfessionalUseCase {
  constructor(
    private readonly professionals: ProfessionalRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(input: DeleteProfessionalInput): Promise<void> {
    this.authorizer.assertCanManageClinic(input.actor, input.clinicId);

    const existing = await this.professionals.findById(input.professionalId);
    if (!existing || existing.clinicId !== input.clinicId) {
      throw new NotFoundError("Profissional não encontrado.");
    }

    await this.professionals.delete(input.professionalId);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: "professional.deleted",
      entityType: "professional",
      entityId: input.professionalId,
    });
  }
}
