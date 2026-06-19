import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { DrizzleAuditLog } from "@/core/shared/infra/drizzle-audit-log";

import { DeletePrescriptionUseCase } from "../../application/use-cases/delete-prescription";
import { UpsertPrescriptionUseCase } from "../../application/use-cases/upsert-prescription";
import { DrizzlePatientAccessChecker } from "../persistence/drizzle-patient-access";
import { DrizzlePrescriptionRepository } from "../persistence/drizzle-prescription-repository";

export const makeUpsertPrescription = () =>
  new UpsertPrescriptionUseCase(
    new DrizzlePrescriptionRepository(),
    new DrizzlePatientAccessChecker(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );

export const makeDeletePrescription = () =>
  new DeletePrescriptionUseCase(
    new DrizzlePrescriptionRepository(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );
