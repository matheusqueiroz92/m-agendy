import { NotFoundError } from "@/core/shared/domain/errors";

import { AuthenticatedActor } from "../domain/authenticated-actor";

/**
 * Resolve a clínica "atual" do ator (primeira associação), preservando o
 * comportamento de clínica única do app. Quando o suporte a múltiplas clínicas
 * for ativado, este é o ponto a evoluir (ex.: clínica vinda do contexto/URL).
 */
export const resolveCurrentClinicId = (actor: AuthenticatedActor): string => {
  const clinicId = actor.memberships[0]?.clinicId;
  if (!clinicId) {
    throw new NotFoundError("Nenhuma clínica associada ao usuário.");
  }
  return clinicId;
};
