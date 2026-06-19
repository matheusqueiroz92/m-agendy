import { eq } from "drizzle-orm";

import { db } from "@/db";
import { usersTable } from "@/db/schema";

import { SubscriptionPlan } from "../../domain/subscription-plan";
import { SubscriptionRepository } from "../../application/ports/subscription-repository";

/** Persistência da assinatura no usuário (Drizzle/Postgres). */
export class DrizzleSubscriptionRepository implements SubscriptionRepository {
  async activate(params: {
    userId: string;
    customerId: string;
    subscriptionId: string;
    plan: SubscriptionPlan;
  }): Promise<void> {
    await db
      .update(usersTable)
      .set({
        stripeCustomerId: params.customerId,
        stripeSubscriptionId: params.subscriptionId,
        plan: params.plan,
      })
      .where(eq(usersTable.id, params.userId));
  }

  async deactivate(params: { userId: string }): Promise<void> {
    await db
      .update(usersTable)
      .set({
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        plan: null,
      })
      .where(eq(usersTable.id, params.userId));
  }
}
