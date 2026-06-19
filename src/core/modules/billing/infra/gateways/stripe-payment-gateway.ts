import Stripe from "stripe";

import { BillingEvent } from "../../domain/billing-event";
import { getPlan, isValidPlan } from "../../domain/plans";
import {
  CheckoutSession,
  CreateCheckoutInput,
  ParseWebhookInput,
  PaymentGateway,
} from "../../application/ports/payment-gateway";

const STRIPE_API_VERSION = "2025-05-28.basil";

interface StripeGatewayConfig {
  secretKey?: string;
  webhookSecret?: string;
}

/**
 * Adapter do gateway de pagamento para a Stripe. Traduz checkout e webhooks da
 * Stripe para o contrato genérico PaymentGateway / BillingEvent.
 *
 * O preço de cada plano é resolvido pelo catálogo: cada plano aponta para uma
 * env (`stripePriceEnv`) com o price ID. O plano contratado viaja no metadata da
 * assinatura, então o webhook sabe qual plano ativar — sem mapa reverso de preços.
 */
export class StripePaymentGateway implements PaymentGateway {
  private readonly stripe: Stripe;

  constructor(private readonly config: StripeGatewayConfig) {
    if (!config.secretKey) {
      throw new Error("Stripe secret key not found");
    }
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: STRIPE_API_VERSION,
    });
  }

  private priceIdFor(plan: string): string {
    const envName = getPlan(plan)?.stripePriceEnv;
    const priceId = envName ? process.env[envName] : undefined;
    if (!priceId) {
      throw new Error(`Price ID não configurado para o plano "${plan}".`);
    }
    return priceId;
  }

  async createCheckoutSession(
    input: CreateCheckoutInput,
  ): Promise<CheckoutSession> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      subscription_data: {
        // userId + plano contratado para reconstruir o vínculo no webhook.
        metadata: { userId: input.userId, plan: input.plan },
      },
      line_items: [{ price: this.priceIdFor(input.plan), quantity: 1 }],
    });

    if (!session.url) {
      throw new Error("Stripe checkout session URL not found");
    }

    return { checkoutUrl: session.url };
  }

  async parseWebhookEvent(input: ParseWebhookInput): Promise<BillingEvent> {
    if (!this.config.webhookSecret) {
      throw new Error("Stripe webhook secret not found");
    }
    if (!input.signature) {
      throw new Error("Stripe signature not found");
    }

    const event = this.stripe.webhooks.constructEvent(
      input.rawBody,
      input.signature,
      this.config.webhookSecret,
    );

    switch (event.type) {
      case "invoice.paid": {
        const object = event.data.object as unknown as {
          customer?: string;
          parent?: {
            subscription_details?: {
              metadata?: { userId?: string; plan?: string };
              subscription?: string;
            };
          };
        };

        const details = object.parent?.subscription_details;
        const userId = details?.metadata?.userId;
        const subscriptionId = details?.subscription;
        const customerId = object.customer;

        if (!userId || !subscriptionId || !customerId) {
          return { type: "ignored" };
        }

        // Plano contratado vem do metadata; fallback "premium" por compat.
        const metaPlan = details?.metadata?.plan;
        const plan = isValidPlan(metaPlan) ? metaPlan : "premium";

        return {
          type: "subscription_activated",
          userId,
          customerId,
          subscriptionId,
          plan,
        };
      }

      case "customer.subscription.deleted": {
        const subscription = await this.stripe.subscriptions.retrieve(
          event.data.object.id,
        );
        const userId = subscription.metadata.userId;

        if (!userId) {
          return { type: "ignored" };
        }

        return { type: "subscription_cancelled", userId };
      }

      default:
        return { type: "ignored" };
    }
  }
}
