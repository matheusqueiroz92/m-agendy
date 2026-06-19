import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { DrizzleAuditLog } from "@/core/shared/infra/drizzle-audit-log";

import { UpsertMedicalRecordUseCase } from "../../application/use-cases/upsert-medical-record";
import { DrizzleMedicalRecordRepository } from "../persistence/drizzle-medical-record-repository";
import { DrizzlePatientAccessChecker } from "../persistence/drizzle-patient-access";

/** Composition root dos casos de uso do prontuário base (antecedentes). */
export const makeUpsertMedicalRecord = () =>
  new UpsertMedicalRecordUseCase(
    new DrizzleMedicalRecordRepository(),
    new DrizzlePatientAccessChecker(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );
