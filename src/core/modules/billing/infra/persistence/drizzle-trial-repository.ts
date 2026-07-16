import { eq } from "drizzle-orm";

import { db } from "@/db";
import { usersTable } from "@/db/schema";

import { SubscriptionPlan } from "../../domain/subscription-plan";
import { TrialEligibility, TrialRepository } from "../../application/ports/trial-repository";

/** Persistência do trial no usuário (Drizzle/Postgres). */
export class DrizzleTrialRepository implements TrialRepository {
  async getEligibility(userId: string): Promise<TrialEligibility> {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    return {
      plan: user?.plan ?? null,
      hasUsedTrial: user?.hasUsedTrial ?? false,
    };
  }

  async start(params: {
    userId: string;
    plan: SubscriptionPlan;
    expiresAt: Date;
  }): Promise<void> {
    await db
      .update(usersTable)
      .set({
        plan: params.plan,
        planExpiresAt: params.expiresAt,
        hasUsedTrial: true,
      })
      .where(eq(usersTable.id, params.userId));
  }
}
