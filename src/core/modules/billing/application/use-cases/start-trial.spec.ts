import { describe, expect, it } from "vitest";

import { UnauthorizedError } from "@/core/shared/domain/errors";

import { BillingValidationError } from "../../domain/errors";
import { InMemoryTrialRepository } from "../testing/billing-fakes";
import { StartTrialUseCase } from "./start-trial";

class FixedClock {
  constructor(private readonly fixed: Date) {}
  now(): Date {
    return this.fixed;
  }
}

const now = new Date("2026-07-16T12:00:00.000Z");

describe("StartTrialUseCase", () => {
  it("inicia o trial do Essential por 7 dias", async () => {
    const repo = new InMemoryTrialRepository();
    const useCase = new StartTrialUseCase(repo, new FixedClock(now));

    const result = await useCase.execute({ userId: "user-1", plan: "essential" });

    expect(result.plan).toBe("essential");
    expect(result.planExpiresAt.toISOString()).toBe("2026-07-23T12:00:00.000Z");
    expect(repo.started[0]).toEqual({
      userId: "user-1",
      plan: "essential",
      expiresAt: result.planExpiresAt,
    });
  });

  it("inicia o trial do Premium por 14 dias", async () => {
    const repo = new InMemoryTrialRepository();
    const useCase = new StartTrialUseCase(repo, new FixedClock(now));

    const result = await useCase.execute({ userId: "user-1", plan: "premium" });

    expect(result.planExpiresAt.toISOString()).toBe("2026-07-30T12:00:00.000Z");
  });

  it("rejeita quando não há usuário autenticado", async () => {
    const useCase = new StartTrialUseCase(
      new InMemoryTrialRepository(),
      new FixedClock(now),
    );

    await expect(
      useCase.execute({ userId: null, plan: "essential" }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rejeita plano inexistente", async () => {
    const useCase = new StartTrialUseCase(
      new InMemoryTrialRepository(),
      new FixedClock(now),
    );

    await expect(
      useCase.execute({ userId: "user-1", plan: "inexistente" }),
    ).rejects.toBeInstanceOf(BillingValidationError);
  });

  it("rejeita plano sem trial self-service (Gold)", async () => {
    const useCase = new StartTrialUseCase(
      new InMemoryTrialRepository(),
      new FixedClock(now),
    );

    await expect(
      useCase.execute({ userId: "user-1", plan: "gold" }),
    ).rejects.toBeInstanceOf(BillingValidationError);
  });

  it("rejeita quem já usou o trial antes", async () => {
    const repo = new InMemoryTrialRepository({
      "user-1": { plan: null, hasUsedTrial: true },
    });
    const useCase = new StartTrialUseCase(repo, new FixedClock(now));

    await expect(
      useCase.execute({ userId: "user-1", plan: "essential" }),
    ).rejects.toBeInstanceOf(BillingValidationError);
  });

  it("rejeita quem já possui um plano ativo", async () => {
    const repo = new InMemoryTrialRepository({
      "user-1": { plan: "premium", hasUsedTrial: false },
    });
    const useCase = new StartTrialUseCase(repo, new FixedClock(now));

    await expect(
      useCase.execute({ userId: "user-1", plan: "essential" }),
    ).rejects.toBeInstanceOf(BillingValidationError);
  });
});
