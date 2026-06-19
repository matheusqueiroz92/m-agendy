import { describe, expect, it } from "vitest";

import {
  FakePaymentGateway,
  InMemorySubscriptionRepository,
} from "../testing/billing-fakes";
import { HandleBillingWebhookUseCase } from "./handle-billing-webhook";

describe("HandleBillingWebhookUseCase", () => {
  const input = { rawBody: "{}", signature: "sig" };

  it("ativa a assinatura ao receber subscription_activated", async () => {
    const gateway = new FakePaymentGateway({
      nextEvent: {
        type: "subscription_activated",
        userId: "user-1",
        customerId: "cus_1",
        subscriptionId: "sub_1",
        plan: "premium",
      },
    });
    const repo = new InMemorySubscriptionRepository();
    const useCase = new HandleBillingWebhookUseCase(gateway, repo);

    await useCase.execute(input);

    expect(repo.activated).toHaveLength(1);
    expect(repo.activated[0]).toMatchObject({
      userId: "user-1",
      customerId: "cus_1",
      subscriptionId: "sub_1",
      plan: "premium",
    });
    expect(gateway.parseCalls[0]).toEqual(input);
  });

  it("desativa a assinatura ao receber subscription_cancelled", async () => {
    const gateway = new FakePaymentGateway({
      nextEvent: { type: "subscription_cancelled", userId: "user-9" },
    });
    const repo = new InMemorySubscriptionRepository();

    await new HandleBillingWebhookUseCase(gateway, repo).execute(input);

    expect(repo.deactivated).toEqual(["user-9"]);
  });

  it("ignora eventos irrelevantes sem tocar no repositório", async () => {
    const gateway = new FakePaymentGateway({ nextEvent: { type: "ignored" } });
    const repo = new InMemorySubscriptionRepository();

    await new HandleBillingWebhookUseCase(gateway, repo).execute(input);

    expect(repo.activated).toHaveLength(0);
    expect(repo.deactivated).toHaveLength(0);
  });
});
