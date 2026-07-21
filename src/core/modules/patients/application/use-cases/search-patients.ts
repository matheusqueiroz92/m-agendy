import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";

import {
  PatientRepository,
  PatientSearchResult,
} from "../ports/patient-repository";

export interface SearchPatientsInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  query: string;
  limit: number;
}

/**
 * Busca pacientes da clínica por nome, e-mail ou telefone.
 * Exige papel de gestão (owner/manager ou admin de plataforma).
 */
export class SearchPatientsUseCase {
  constructor(
    private readonly patients: PatientRepository,
    private readonly authorizer: Authorizer,
  ) {}

  async execute(input: SearchPatientsInput): Promise<PatientSearchResult[]> {
    this.authorizer.assertCanManageClinic(input.actor, input.clinicId);

    return this.patients.searchByClinic({
      clinicId: input.clinicId,
      query: input.query,
      limit: input.limit,
    });
  }
}
