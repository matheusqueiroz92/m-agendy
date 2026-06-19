import { UnauthorizedError } from "@/core/shared/domain/errors";

import { BillingValidationError } from "../../domain/errors";
import { getPlan, isValidPlan } from "../../domain/plans";
import { CheckoutSession, PaymentGateway } from "../ports/payment-gateway";

export interface CreateCheckoutSessionInput {
  userId: string | null | undefined;
  plan: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Cria a sessão de checkout de assinatura para o plano escolhido.
 * Independente de gateway: delega ao PaymentGateway injetado.
 */
export class CreateCheckoutSessionUseCase {
  constructor(private readonly gateway: PaymentGateway) {}

  async execute(input: CreateCheckoutSessionInput): Promise<CheckoutSession> {
    if (!input.userId) {
      throw new UnauthorizedError();
    }
    if (!isValidPlan(input.plan)) {
      throw new BillingValidationError("Plano inválido.");
    }
    if (!getPlan(input.plan)?.stripePriceEnv) {
      throw new BillingValidationError(
        "Este plano não está disponível para contratação online.",
      );
    }

    return this.gateway.createCheckoutSession({
      userId: input.userId,
      plan: input.plan,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    });
  }
}
