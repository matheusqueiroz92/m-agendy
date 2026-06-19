import { CreateCheckoutSessionUseCase } from "../../application/use-cases/create-checkout-session";
import { HandleBillingWebhookUseCase } from "../../application/use-cases/handle-billing-webhook";
import { DrizzleSubscriptionRepository } from "../persistence/drizzle-subscription-repository";
import { makePaymentGateway } from "./make-payment-gateway";

/** Composition root do checkout de assinatura. */
export const makeCreateCheckoutSession = () =>
  new CreateCheckoutSessionUseCase(makePaymentGateway());

/** Composition root do processamento de webhooks de cobrança. */
export const makeHandleBillingWebhook = () =>
  new HandleBillingWebhookUseCase(
    makePaymentGateway(),
    new DrizzleSubscriptionRepository(),
  );
