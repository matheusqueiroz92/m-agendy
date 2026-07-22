import { getPlan, PlanEntitlements } from "./plans";

/** Plano sem direitos (fallback para plano desconhecido/ausente). */
const NONE: PlanEntitlements = {
  maxProfessionals: 0,
  maxAppointmentsPerMonth: 0,
  maxAppointmentsPerDay: 0,
  detailedMetrics: false,
  aiInsights: false,
  canUseOwnWhatsAppNumber: false,
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

/**
 * Pode criar mais um agendamento hoje dado o total já criado hoje?
 * Controla o volume diário de mensagens de WhatsApp, independente do limite
 * mensal (que é sobre capacidade de agenda, não sobre volume de mensagens).
 */
export const canCreateAppointmentToday = (
  planId: string | null | undefined,
  todayCount: number,
): boolean => {
  const max = entitlementsOf(planId).maxAppointmentsPerDay;
  return max === null || todayCount < max;
};

/**
 * Está a exatamente 1 agendamento de bater o limite diário do plano? Usado
 * para avisar a clínica antes de efetivamente bloquear (`todayCount` é a
 * contagem JÁ incluindo o agendamento recém-criado).
 */
export const isOneAppointmentAwayFromDailyLimit = (
  planId: string | null | undefined,
  todayCount: number,
): boolean => {
  const max = entitlementsOf(planId).maxAppointmentsPerDay;
  return max !== null && todayCount === max - 1;
};

/**
 * O plano libera um recurso booleano (ex.: detailedMetrics, aiInsights,
 * canUseOwnWhatsAppNumber)?
 */
export const planHasFeature = (
  planId: string | null | undefined,
  feature: "detailedMetrics" | "aiInsights" | "canUseOwnWhatsAppNumber",
): boolean => entitlementsOf(planId)[feature] === true;
