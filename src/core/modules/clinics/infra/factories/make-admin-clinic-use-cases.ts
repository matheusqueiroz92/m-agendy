import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { DrizzleAuditLog } from "@/core/shared/infra/drizzle-audit-log";

import { DeleteClinicUseCase } from "../../application/use-cases/delete-clinic";
import { ListClinicsAdminUseCase } from "../../application/use-cases/list-clinics-admin";
import { SetClinicPlanOverrideUseCase } from "../../application/use-cases/set-clinic-plan-override";
import { SetClinicStatusUseCase } from "../../application/use-cases/set-clinic-status";
import { UpsertClinicUseCase } from "../../application/use-cases/upsert-clinic";
import { DrizzleClinicOwnerProvisioner } from "../auth/drizzle-clinic-owner-provisioner";
import { DrizzleAdminClinicRepository } from "../persistence/drizzle-admin-clinic-repository";

const repo = () => new DrizzleAdminClinicRepository();

export const makeListClinicsAdmin = () =>
  new ListClinicsAdminUseCase(repo(), new Authorizer());

export const makeUpsertClinic = () =>
  new UpsertClinicUseCase(
    repo(),
    new Authorizer(),
    new DrizzleAuditLog(),
    new DrizzleClinicOwnerProvisioner(),
  );

export const makeDeleteClinic = () =>
  new DeleteClinicUseCase(repo(), new Authorizer(), new DrizzleAuditLog());

export const makeSetClinicStatus = () =>
  new SetClinicStatusUseCase(repo(), new Authorizer(), new DrizzleAuditLog());

export const makeSetClinicPlanOverride = () =>
  new SetClinicPlanOverrideUseCase(repo(), new Authorizer(), new DrizzleAuditLog());
