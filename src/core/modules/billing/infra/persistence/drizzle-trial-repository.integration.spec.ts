import { beforeEach, describe, expect, it } from "vitest";

import { resetTestDatabase } from "@/core/shared/infra/testing/reset-test-database";
import { seedUser } from "@/core/shared/infra/testing/seed-test-data";

import { DrizzleTrialRepository } from "./drizzle-trial-repository";

describe("DrizzleTrialRepository (integração)", () => {
  const repo = new DrizzleTrialRepository();

  beforeEach(async () => {
    await resetTestDatabase();
  });

  it("elegibilidade padrão de um usuário novo: sem plano, trial não usado", async () => {
    const user = await seedUser();

    await expect(repo.getEligibility(user.id)).resolves.toEqual({
      plan: null,
      hasUsedTrial: false,
    });
  });

  it("start grava plano, expiração e marca hasUsedTrial", async () => {
    const user = await seedUser();
    const expiresAt = new Date("2026-07-30T12:00:00.000Z");

    await repo.start({ userId: user.id, plan: "essential", expiresAt });

    await expect(repo.getEligibility(user.id)).resolves.toEqual({
      plan: "essential",
      hasUsedTrial: true,
    });
  });

  it("reflete hasUsedTrial mesmo depois que o plano é removido", async () => {
    const user = await seedUser({ plan: null, hasUsedTrial: true });

    await expect(repo.getEligibility(user.id)).resolves.toEqual({
      plan: null,
      hasUsedTrial: true,
    });
  });
});
