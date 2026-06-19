import { PlanId } from "./plans";

/**
 * Plano de assinatura da plataforma. Os planos disponíveis vivem no catálogo
 * central em `plans.ts` — adicione novos planos lá, não aqui.
 */
export type SubscriptionPlan = PlanId;

/** Estado do plano de um usuário: um plano ativo ou nenhum (sem assinatura). */
export type SubscriptionPlanState = SubscriptionPlan | null;
