import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { FollowUpRepository } from "../ports/follow-up-repository";

export interface DeleteFollowUpInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  followUpId: string;
}

/** Remove um acompanhamento, validando isolamento por clínica e auditando. */
export class DeleteFollowUpUseCase {
  constructor(
    private readonly followUps: FollowUpRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(input: DeleteFollowUpInput): Promise<void> {
    this.authorizer.assertCanAccessClinicalData(input.actor, input.clinicId);

    const existing = await this.followUps.findById(input.followUpId);
    if (!existing || existing.clinicId !== input.clinicId) {
      throw new NotFoundError("Acompanhamento não encontrado.");
    }

    await this.followUps.delete(input.followUpId);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: "follow_up.deleted",
      entityType: "follow_up",
      entityId: input.followUpId,
    });
  }
}
