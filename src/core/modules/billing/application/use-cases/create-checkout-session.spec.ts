import { describe, expect, it } from "vitest";

import { UnauthorizedError } from "@/core/shared/domain/errors";

import { BillingValidationError } from "../../domain/errors";
import { FakePaymentGateway } from "../testing/billing-fakes";
import { CreateCheckoutSessionUseCase } from "./create-checkout-session";

describe("CreateCheckoutSessionUseCase", () => {
  it("cria a sessão do plano escolhido e devolve a URL", async () => {
    const gateway = new FakePaymentGateway({
      checkoutUrl: "https://checkout.test/sess_123",
    });
    const useCase = new CreateCheckoutSessionUseCase(gateway);

    const result = await useCase.execute({
      userId: "user-1",
      plan: "premium",
      successUrl: "https://app/dashboard",
      cancelUrl: "https://app/dashboard",
    });

    expect(result.checkoutUrl).toBe("https://checkout.test/sess_123");
    expect(gateway.checkoutCalls[0].plan).toBe("premium");
  });

  it("rejeita quando não há usuário autenticado", async () => {
    const useCase = new CreateCheckoutSessionUseCase(new FakePaymentGateway());

    await expect(
      useCase.execute({
        userId: null,
        plan: "premium",
        successUrl: "https://app",
        cancelUrl: "https://app",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rejeita plano inexistente", async () => {
    const useCase = new CreateCheckoutSessionUseCase(new FakePaymentGateway());

    await expect(
      useCase.execute({
        userId: "user-1",
        plan: "inexistente",
        successUrl: "https://app",
        cancelUrl: "https://app",
      }),
    ).rejects.toBeInstanceOf(BillingValidationError);
  });
});
