import { SubscriptionPlan } from "../../domain/subscription-plan";

/**
 * Persistência do estado de assinatura do usuário. Abstrai o banco do caso de
 * uso: hoje Drizzle/Postgres, amanhã o que for.
 */
export interface SubscriptionRepository {
  /** Marca o usuário como assinante ativo do plano informado. */
  activate(params: {
    userId: string;
    customerId: string;
    subscriptionId: string;
    plan: SubscriptionPlan;
  }): Promise<void>;

  /** Remove a assinatura do usuário (cancelamento). */
  deactivate(params: { userId: string }): Promise<void>;
}
