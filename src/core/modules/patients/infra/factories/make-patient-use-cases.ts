import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { DrizzleAuditLog } from "@/core/shared/infra/drizzle-audit-log";

import { DeletePatientUseCase } from "../../application/use-cases/delete-patient";
import { SearchPatientsUseCase } from "../../application/use-cases/search-patients";
import { UpsertPatientUseCase } from "../../application/use-cases/upsert-patient";
import { DrizzlePatientRepository } from "../persistence/drizzle-patient-repository";

/** Composition roots dos casos de uso de Pacientes. */
export const makeUpsertPatient = () =>
  new UpsertPatientUseCase(
    new DrizzlePatientRepository(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );

export const makeDeletePatient = () =>
  new DeletePatientUseCase(
    new DrizzlePatientRepository(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );

export const makeSearchPatients = () =>
  new SearchPatientsUseCase(new DrizzlePatientRepository(), new Authorizer());
