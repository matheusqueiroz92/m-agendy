import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { ClinicType } from "../../domain/clinic-type";
import { ClinicValidationError } from "../../domain/errors";
import { AdminClinicRepository } from "../ports/admin-clinic-repository";

export interface UpsertClinicInput {
  actor: AuthenticatedActor | null;
  id?: string;
  name: string;
  type: ClinicType;
}

export interface UpsertClinicOutput {
  clinicId: string;
}

/** Cria/edita uma clínica pela plataforma. Restrito ao admin de plataforma. */
export class UpsertClinicUseCase {
  constructor(
    private readonly clinics: AdminClinicRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(input: UpsertClinicInput): Promise<UpsertClinicOutput> {
    this.authorizer.assertPlatformAdmin(input.actor);

    const name = input.name.trim();
    if (!name) {
      throw new ClinicValidationError("O nome da clínica é obrigatório.");
    }

    let clinicId = input.id;
    if (clinicId) {
      if (!(await this.clinics.exists(clinicId))) {
        throw new NotFoundError("Clínica não encontrada.");
      }
      await this.clinics.update(clinicId, { name, type: input.type });
    } else {
      const created = await this.clinics.create({ name, type: input.type });
      clinicId = created.id;
    }

    await this.audit.record({
      clinicId,
      actorUserId: input.actor?.userId,
      action: input.id ? "clinic.updated" : "clinic.created",
      entityType: "clinic",
      entityId: clinicId,
    });

    return { clinicId };
  }
}
