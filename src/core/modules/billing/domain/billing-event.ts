import { SubscriptionPlan } from "./subscription-plan";

/**
 * Evento de cobrança NORMALIZADO, independente de gateway.
 *
 * Cada adapter de PaymentGateway (Stripe, Pagar.me, Mercado Pago...) é
 * responsável por traduzir o webhook do seu provedor para um destes formatos.
 * Assim, o caso de uso que reage a eventos nunca conhece um provedor específico.
 */
export type BillingEvent =
  | {
      type: "subscription_activated";
      userId: string;
      customerId: string;
      subscriptionId: string;
      plan: SubscriptionPlan;
    }
  | {
      type: "subscription_cancelled";
      userId: string;
    }
  | {
      // Evento recebido, porém irrelevante para o nosso domínio.
      type: "ignored";
    };
