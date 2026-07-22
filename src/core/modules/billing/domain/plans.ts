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
  /**
   * Máximo de agendamentos CRIADOS por dia (null = ilimitado). Controla o
   * volume de mensagens de WhatsApp disparadas (cada agendamento criado gera
   * uma confirmação imediata + lembretes futuros) — independente do limite
   * mensal, que é um teto de capacidade, não de volume de mensagens.
   */
  maxAppointmentsPerDay: number | null;
  /** Métricas detalhadas no dashboard. */
  detailedMetrics: boolean;
  /** Análise de métricas com IA. */
  aiInsights: boolean;
  /**
   * Libera solicitar a integração do PRÓPRIO número de WhatsApp da clínica
   * (mensagens saem com o nome/número da clínica, não o compartilhado da
   * plataforma). No Essential, só o número compartilhado está disponível.
   */
  canUseOwnWhatsAppNumber: boolean;
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
      maxAppointmentsPerDay: 15,
      detailedMetrics: false,
      aiInsights: false,
      canUseOwnWhatsAppNumber: false,
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
      maxAppointmentsPerDay: 40,
      detailedMetrics: true,
      aiInsights: false,
      canUseOwnWhatsAppNumber: true,
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
      maxAppointmentsPerDay: null,
      detailedMetrics: true,
      aiInsights: true,
      canUseOwnWhatsAppNumber: true,
    },
  },
] as const satisfies readonly PlanDefinition[];

export type PlanId = (typeof PLAN_CATALOG)[number]["id"];

export const PLAN_IDS = PLAN_CATALOG.map((p) => p.id) as PlanId[];

export const isValidPlan = (value: string | null | undefined): value is PlanId =>
  !!value && PLAN_IDS.includes(value as PlanId);

export const getPlan = (id: string): PlanDefinition | undefined =>
  PLAN_CATALOG.find((p) => p.id === id);

export const getPlanLabel = (id: string | null | undefined): string =>
  (id && getPlan(id)?.label) || "—";
