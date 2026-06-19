import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { DrizzleAuditLog } from "@/core/shared/infra/drizzle-audit-log";

import { DeleteClinicalAttendanceUseCase } from "../../application/use-cases/delete-clinical-attendance";
import { UpsertClinicalAttendanceUseCase } from "../../application/use-cases/upsert-clinical-attendance";
import { DrizzleClinicalAttendanceRepository } from "../persistence/drizzle-clinical-attendance-repository";
import { DrizzlePatientAccessChecker } from "../persistence/drizzle-patient-access";

export const makeUpsertClinicalAttendance = () =>
  new UpsertClinicalAttendanceUseCase(
    new DrizzleClinicalAttendanceRepository(),
    new DrizzlePatientAccessChecker(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );

export const makeDeleteClinicalAttendance = () =>
  new DeleteClinicalAttendanceUseCase(
    new DrizzleClinicalAttendanceRepository(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );
