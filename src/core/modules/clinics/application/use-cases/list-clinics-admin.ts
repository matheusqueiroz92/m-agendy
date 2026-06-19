import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";

import {
  AdminClinicListItem,
  AdminClinicRepository,
} from "../ports/admin-clinic-repository";

export interface ListClinicsAdminInput {
  actor: AuthenticatedActor | null;
}

/** Lista detalhada de clínicas para a área de plataforma. Restrito ao admin. */
export class ListClinicsAdminUseCase {
  constructor(
    private readonly clinics: AdminClinicRepository,
    private readonly authorizer: Authorizer,
  ) {}

  async execute(input: ListClinicsAdminInput): Promise<AdminClinicListItem[]> {
    this.authorizer.assertPlatformAdmin(input.actor);
    return this.clinics.listAll();
  }
}
