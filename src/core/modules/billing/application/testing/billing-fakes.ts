import { BillingEvent } from "../../domain/billing-event";
import { SubscriptionPlan } from "../../domain/subscription-plan";
import {
  CheckoutSession,
  CreateCheckoutInput,
  ParseWebhookInput,
  PaymentGateway,
} from "../ports/payment-gateway";
import { SubscriptionRepository } from "../ports/subscription-repository";

/** Gateway de pagamento falso, configurável, para testes de caso de uso. */
export class FakePaymentGateway implements PaymentGateway {
  checkoutCalls: CreateCheckoutInput[] = [];
  parseCalls: ParseWebhookInput[] = [];

  constructor(
    private readonly config: {
      checkoutUrl?: string;
      nextEvent?: BillingEvent;
    } = {},
  ) {}

  async createCheckoutSession(
    input: CreateCheckoutInput,
  ): Promise<CheckoutSession> {
    this.checkoutCalls.push(input);
    return { checkoutUrl: this.config.checkoutUrl ?? "https://checkout.test/abc" };
  }

  async parseWebhookEvent(input: ParseWebhookInput): Promise<BillingEvent> {
    this.parseCalls.push(input);
    return this.config.nextEvent ?? { type: "ignored" };
  }
}

interface ActivateRecord {
  userId: string;
  customerId: string;
  subscriptionId: string;
  plan: SubscriptionPlan;
}

/** Repositório de assinatura em memória. */
export class InMemorySubscriptionRepository implements SubscriptionRepository {
  activated: ActivateRecord[] = [];
  deactivated: string[] = [];

  async activate(params: ActivateRecord): Promise<void> {
    this.activated.push(params);
  }

  async deactivate(params: { userId: string }): Promise<void> {
    this.deactivated.push(params.userId);
  }
}
