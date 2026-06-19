import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { ClinicStatus } from "../../domain/clinic-access";
import { AdminClinicRepository } from "../ports/admin-clinic-repository";

export interface SetClinicStatusInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  status: ClinicStatus;
  reason?: string;
}

/** Bloqueia/libera o acesso de uma clínica. Restrito ao admin de plataforma. */
export class SetClinicStatusUseCase {
  constructor(
    private readonly clinics: AdminClinicRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(input: SetClinicStatusInput): Promise<void> {
    this.authorizer.assertPlatformAdmin(input.actor);

    if (!(await this.clinics.exists(input.clinicId))) {
      throw new NotFoundError("Clínica não encontrada.");
    }

    const reason =
      input.status === "blocked" ? (input.reason?.trim() || null) : null;

    await this.clinics.setStatus(input.clinicId, input.status, reason);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: input.status === "blocked" ? "clinic.blocked" : "clinic.unblocked",
      entityType: "clinic",
      entityId: input.clinicId,
    });
  }
}
