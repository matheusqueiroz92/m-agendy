import { AuthenticatedActor } from "../../domain/authenticated-actor";
import { Authorizer } from "../authorizer";
import { ClinicDirectory, ClinicSummary } from "../ports/clinic-directory";

export interface ListClinicsInput {
  actor: AuthenticatedActor | null;
}

/**
 * Lista todas as clínicas da plataforma. Restrito ao admin de plataforma.
 */
export class ListClinicsUseCase {
  constructor(
    private readonly directory: ClinicDirectory,
    private readonly authorizer: Authorizer,
  ) {}

  async execute(input: ListClinicsInput): Promise<ClinicSummary[]> {
    this.authorizer.assertPlatformAdmin(input.actor);
    return this.directory.listAllWithStats();
  }
}
