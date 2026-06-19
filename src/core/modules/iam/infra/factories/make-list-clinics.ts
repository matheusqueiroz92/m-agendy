import { Authorizer } from "../../application/authorizer";
import { ListClinicsUseCase } from "../../application/use-cases/list-clinics";
import { DrizzleClinicDirectory } from "../persistence/drizzle-clinic-directory";

export const makeListClinics = () =>
  new ListClinicsUseCase(new DrizzleClinicDirectory(), new Authorizer());
