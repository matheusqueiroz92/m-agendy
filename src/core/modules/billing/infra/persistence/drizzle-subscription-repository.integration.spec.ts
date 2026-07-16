import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { resetTestDatabase } from "@/core/shared/infra/testing/reset-test-database";
import { seedUser } from "@/core/shared/infra/testing/seed-test-data";

import { DrizzleSubscriptionRepository } from "./drizzle-subscription-repository";

/**
 * Testes de integração do repositório de assinatura: dinheiro real passa por
 * aqui (é o que o webhook da Stripe grava). Também confirma que `activate`
 * limpa `plan_expires_at` (para um trial anterior não "vazar" validade para o
 * plano pago — ver `docs/08-administracao-e-planos.md`).
 */
describe("DrizzleSubscriptionRepository (integração)", () => {
  const repo = new DrizzleSubscriptionRepository();

  beforeEach(async () => {
    await resetTestDatabase();
  });

  it("ativa a assinatura e grava customerId/subscriptionId/plano", async () => {
    const user = await seedUser({ plan: "trial", planExpiresAt: new Date("2026-07-20") });

    await repo.activate({
      userId: user.id,
      customerId: "cus_123",
      subscriptionId: "sub_123",
      plan: "premium",
    });

    const [row] = await db.select().from(usersTable).where(eq(usersTable.id, user.id));
    expect(row.plan).toBe("premium");
    expect(row.stripeCustomerId).toBe("cus_123");
    expect(row.stripeSubscriptionId).toBe("sub_123");
    // Assinatura paga não deve carregar uma expiração de trial anterior.
    expect(row.planExpiresAt).toBeNull();
  });

  it("desativa a assinatura e limpa plano/expiração", async () => {
    const user = await seedUser({
      plan: "premium",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
    });

    await repo.deactivate({ userId: user.id });

    const [row] = await db.select().from(usersTable).where(eq(usersTable.id, user.id));
    expect(row.plan).toBeNull();
    expect(row.stripeCustomerId).toBeNull();
    expect(row.stripeSubscriptionId).toBeNull();
    expect(row.planExpiresAt).toBeNull();
  });
});
