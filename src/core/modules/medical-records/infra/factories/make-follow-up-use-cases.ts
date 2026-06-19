import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { DrizzleAuditLog } from "@/core/shared/infra/drizzle-audit-log";

import { DeleteFollowUpUseCase } from "../../application/use-cases/delete-follow-up";
import { UpsertFollowUpUseCase } from "../../application/use-cases/upsert-follow-up";
import { DrizzleFollowUpRepository } from "../persistence/drizzle-follow-up-repository";
import { DrizzlePatientAccessChecker } from "../persistence/drizzle-patient-access";

export const makeUpsertFollowUp = () =>
  new UpsertFollowUpUseCase(
    new DrizzleFollowUpRepository(),
    new DrizzlePatientAccessChecker(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );

export const makeDeleteFollowUp = () =>
  new DeleteFollowUpUseCase(
    new DrizzleFollowUpRepository(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );
