import { PaymentGateway } from "../ports/payment-gateway";
import { SubscriptionRepository } from "../ports/subscription-repository";

export interface HandleBillingWebhookInput {
  rawBody: string;
  signature: string | null;
}

/**
 * Processa um webhook de cobrança. O gateway valida a assinatura e traduz o
 * payload do provedor em um BillingEvent normalizado; este caso de uso apenas
 * reage ao evento de domínio, sem conhecer nenhum provedor específico.
 */
export class HandleBillingWebhookUseCase {
  constructor(
    private readonly gateway: PaymentGateway,
    private readonly subscriptions: SubscriptionRepository,
  ) {}

  async execute(input: HandleBillingWebhookInput): Promise<void> {
    const event = await this.gateway.parseWebhookEvent({
      rawBody: input.rawBody,
      signature: input.signature,
    });

    switch (event.type) {
      case "subscription_activated":
        await this.subscriptions.activate({
          userId: event.userId,
          customerId: event.customerId,
          subscriptionId: event.subscriptionId,
          plan: event.plan,
        });
        return;
      case "subscription_cancelled":
        await this.subscriptions.deactivate({ userId: event.userId });
        return;
      case "ignored":
        return;
    }
  }
}
