import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { DrizzleAuditLog } from "@/core/shared/infra/drizzle-audit-log";

import { DeleteDiagnosisUseCase } from "../../application/use-cases/delete-diagnosis";
import { UpsertDiagnosisUseCase } from "../../application/use-cases/upsert-diagnosis";
import { DrizzleDiagnosisRepository } from "../persistence/drizzle-diagnosis-repository";
import { DrizzlePatientAccessChecker } from "../persistence/drizzle-patient-access";

export const makeUpsertDiagnosis = () =>
  new UpsertDiagnosisUseCase(
    new DrizzleDiagnosisRepository(),
    new DrizzlePatientAccessChecker(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );

export const makeDeleteDiagnosis = () =>
  new DeleteDiagnosisUseCase(
    new DrizzleDiagnosisRepository(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );
