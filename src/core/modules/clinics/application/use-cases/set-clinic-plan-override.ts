import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { AdminClinicRepository } from "../ports/admin-clinic-repository";

export interface SetClinicPlanOverrideInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  /** Plano concedido (ex.: "premium") ou null para remover o override. */
  planOverride: string | null;
  /** Expiração do override (ou null = sem expiração). */
  expiresAt?: Date | null;
}

/**
 * Define/remove o override de plano de uma clínica (cortesia/desconto da
 * plataforma). Restrito ao admin de plataforma.
 */
export class SetClinicPlanOverrideUseCase {
  constructor(
    private readonly clinics: AdminClinicRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(input: SetClinicPlanOverrideInput): Promise<void> {
    this.authorizer.assertPlatformAdmin(input.actor);

    if (!(await this.clinics.exists(input.clinicId))) {
      throw new NotFoundError("Clínica não encontrada.");
    }

    const plan = input.planOverride?.trim() || null;
    const expiresAt = plan ? (input.expiresAt ?? null) : null;

    await this.clinics.setPlanOverride(input.clinicId, plan, expiresAt);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: plan ? "clinic.plan_override_set" : "clinic.plan_override_cleared",
      entityType: "clinic",
      entityId: input.clinicId,
    });
  }
}
