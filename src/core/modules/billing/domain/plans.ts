/**
 * CATÁLOGO CENTRAL DE PLANOS.
 *
 * Único lugar para gerir os planos: identidade, preço, integração com o gateway
 * e o que cada plano LIBERA (entitlements). Para criar um plano novo, adicione
 * uma entrada aqui — tipo, validações, seletor de cortesia e gating reconhecem
 * automaticamente.
 */
export interface PlanEntitlements {
  /** Máximo de profissionais (null = ilimitado). */
  maxProfessionals: number | null;
  /** Máximo de agendamentos por mês (null = ilimitado). */
  maxAppointmentsPerMonth: number | null;
  /** Métricas detalhadas no dashboard. */
  detailedMetrics: boolean;
  /** Análise de métricas com IA. */
  aiInsights: boolean;
}

export interface PlanDefinition {
  id: string;
  label: string;
  description: string;
  monthlyPriceInBRL: number;
  /** Nome da env com o price ID na Stripe (planos pagos). */
  stripePriceEnv?: string;
  /**
   * Dias de teste grátis sem cartão (self-service, via `StartTrialUseCase`).
   * Ausente/undefined = plano não oferece trial self-service (ex.: Gold, que
   * é vendido por consultor).
   */
  trialDays?: number;
  entitlements: PlanEntitlements;
}

export const PLAN_CATALOG = [
  {
    id: "essential",
    label: "Essential",
    description: "Para negócios em crescimento e profissionais autônomos.",
    monthlyPriceInBRL: 39,
    stripePriceEnv: "STRIPE_ESSENTIAL_PLAN_PRICE_ID",
    trialDays: 7,
    entitlements: {
      maxProfessionals: 3,
      maxAppointmentsPerMonth: 100,
      detailedMetrics: false,
      aiInsights: false,
    },
  },
  {
    id: "premium",
    label: "Premium",
    description: "Para clínicas com maior volume de agendamentos.",
    monthlyPriceInBRL: 59,
    stripePriceEnv: "STRIPE_PREMIUM_PLAN_PRICE_ID",
    trialDays: 14,
    entitlements: {
      maxProfessionals: 10,
      maxAppointmentsPerMonth: null,
      detailedMetrics: true,
      aiInsights: false,
    },
  },
  {
    id: "gold",
    label: "Gold",
    description: "Recursos avançados e suporte personalizado.",
    monthlyPriceInBRL: 99,
    stripePriceEnv: "STRIPE_GOLD_PLAN_PRICE_ID",
    // Sem trialDays: plano vendido por consultor (contato), não self-service.
    entitlements: {
      maxProfessionals: null,
      maxAppointmentsPerMonth: null,
      detailedMetrics: true,
      aiInsights: true,
    },
  },
] as const satisfies readonly PlanDefinition[];

export type PlanId = (typeof PLAN_CATALOG)[number]["id"];

export const PLAN_IDS = PLAN_CATALOG.map((p) => p.id) as PlanId[];

export co