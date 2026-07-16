"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { makeStartTrial } from "@/core/modules/billing/infra/factories/make-billing";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

/**
 * Casca de delivery: resolve o usuário autenticado e delega ao caso de uso de
 * billing que inicia o teste grátis sem cartão (Essential/Premium).
 */
export const startTrial = actionClient
  .schema(z.object({ plan: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });

    const result = await makeStartTrial().execute({
      userId: session?.user?.id,
      plan: parsedInput.plan,
    });

    revalidatePath("/new-subscription");
    revalidatePath("/dashboard");

    return result;
  });
