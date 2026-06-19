import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { DrizzleAuditLog } from "@/core/shared/infra/drizzle-audit-log";

import { DeleteProfessionalUseCase } from "../../application/use-cases/delete-professional";
import { UpsertProfessionalUseCase } from "../../application/use-cases/upsert-professional";
import { DrizzleProfessionalRepository } from "../persistence/drizzle-professional-repository";

/** Composition roots dos casos de uso de Profissionais. */
export const makeUpsertProfessional = () =>
  new UpsertProfessionalUseCase(
    new DrizzleProfessionalRepository(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );

export const makeDeleteProfessional = () =>
  new DeleteProfessionalUseCase(
    new DrizzleProfessionalRepository(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );
