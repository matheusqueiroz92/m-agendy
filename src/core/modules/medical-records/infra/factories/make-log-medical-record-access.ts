import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { DrizzleAuditLog } from "@/core/shared/infra/drizzle-audit-log";

import { LogMedicalRecordAccessUseCase } from "../../application/use-cases/log-medical-record-access";
import { DrizzlePatientAccessChecker } from "../persistence/drizzle-patient-access";

export const makeLogMedicalRecordAccess = () =>
  new LogMedicalRecordAccessUseCase(
    new DrizzlePatientAccessChecker(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );
