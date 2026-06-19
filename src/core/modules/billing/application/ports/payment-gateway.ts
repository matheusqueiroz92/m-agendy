import { BillingEvent } from "../../domain/billing-event";

export interface CreateCheckoutInput {
  /** Usuário que assinará (vincula a assinatura à conta). */
  userId: string;
  /** Plano escolhido (id do catálogo). */
  plan: string;
  /** Para onde voltar após sucesso/cancelamento no checkout hospedado. */
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  /** URL do checkout hospedado pelo gateway, para onde redirecionar o usuário. */
  checkoutUrl: string;
}

export interface ParseWebhookInput {
  /** Corpo CRU da requisição (necessário para validar assinatura). */
  rawBody: string;
  /** Assinatura enviada pelo gateway no header. */
  signature: string | null;
}

/**
 * Porta de gateway de pagamento. É o contrato genérico que o domínio enxerga.
 * Trocar Stripe por Pagar.me/Mercado Pago = criar um novo adapter desta porta,
 * sem tocar em casos de uso, delivery ou UI.
 */
export interface PaymentGateway {
  /** Cria uma sessão de checkout de assinatura e devolve a URL para redirecionar. */
  createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSession>;

  /** Valida e traduz o webhook do provedor em um evento de domínio normalizado. */
  parseWebhookEvent(input: ParseWebhookInput): Promise<BillingEvent>;
}
