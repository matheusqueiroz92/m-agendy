import { SubscriptionPlan } from "../../domain/subscription-plan";

/**
 * Estado do usuário relevante para decidir se pode iniciar um teste grátis.
 */
export interface TrialEligibility {
  /** Plano em vigor no momento (ou null = sem plano). */
  plan: string | null;
  /** Já iniciou um trial alguma vez (mesmo que já tenha expirado). */
  hasUsedTrial: boolean;
}

/**
 * Persistência do teste grátis (trial) sem cartão. Abstrai o banco do caso de
 * uso: hoje Drizzle/Postgres, amanhã o que for.
 */
export interface TrialRepository {
  /** Estado atual do usuário, para checar elegibilidade. */
  getEligibility(userId: string): Promise<TrialEligibility>;

  /** Inicia o trial: grava o plano com expiração e marca o trial como usado. */
  start(params: {
    userId: string;
    plan: SubscriptionPlan;
    expiresAt: Date;
  }): Promise<void>;
}
