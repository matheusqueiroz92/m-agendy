import { SystemClock } from "@/core/shared/infra/system-clock";

import { CreateCheckoutSessionUseCase } from "../../application/use-cases/create-checkout-session";
import { HandleBillingWebhookUseCase } from "../../application/use-cases/handle-billing-webhook";
import { StartTrialUseCase } from "../../application/use-cases/start-trial";
import { DrizzleSubscriptionRepository } from "../persistence/drizzle-subscription-repository";
import { DrizzleTrialRepository } from "../persistence/drizzle-trial-repository";
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

/** Composition root do início do teste grátis sem cartão. */
export const makeStartTrial = () =>
  new StartTrialUseCase(new DrizzleTrialRepository(), new SystemClock());
