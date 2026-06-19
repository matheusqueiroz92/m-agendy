import { getPlan, PlanEntitlements } from "./plans";

/** Plano sem direitos (fallback para plano desconhecido/ausente). */
const NONE: PlanEntitlements = {
  maxProfessionals: 0,
  maxAppointmentsPerMonth: 0,
  detailedMetrics: false,
  aiInsights: false,
};

/** Direitos do plano (ou NONE se o plano não existe). */
export const entitlementsOf = (
  planId: string | null | undefined,
): PlanEntitlements => (planId && getPlan(planId)?.entitlements) || NONE;

/** Pode adicionar mais um profissional dado o total atual? */
export const canAddProfessional = (
  planId: string | null | undefined,
  currentCount: number,
): boolean => {
  const max = entitlementsOf(planId).maxProfessionals;
  return max === null || currentCount < max;
};

/** Pode criar mais um agendamento neste mês dado o total atual? */
export const canCreateAppointment = (
  planId: string | null | undefined,
  monthCount: number,
): boolean => {
  const max = entitlementsOf(planId).maxAppointmentsPerMonth;
  return max === null || monthCount < max;
};

/** O plano libera um recurso booleano (ex.: detailedMetrics, aiInsights)? */
export const planHasFeature = (
  planId: string | null | undefined,
  feature: "detailedMetrics" | "aiInsights",
): boolean => entitlementsOf(planId)[feature] === true;
