import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { AdminClinicRepository } from "../ports/admin-clinic-repository";

export interface DeleteClinicInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
}

/** Exclui uma clínica. Restrito ao admin de plataforma. */
export class DeleteClinicUseCase {
  constructor(
    private readonly clinics: AdminClinicRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(input: DeleteClinicInput): Promise<void> {
    this.authorizer.assertPlatformAdmin(input.actor);

    if (!(await this.clinics.exists(input.clinicId))) {
      throw new NotFoundError("Clínica não encontrada.");
    }

    await this.clinics.delete(input.clinicId);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: "clinic.deleted",
      entityType: "clinic",
      entityId: input.clinicId,
    });
  }
}
