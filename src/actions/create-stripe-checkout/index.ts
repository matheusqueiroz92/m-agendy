"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { makeCreateCheckoutSession } from "@/core/modules/billing/infra/factories/make-billing";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

/**
 * Casca de delivery: resolve o usuário autenticado e delega ao caso de uso de
 * billing, repassando o plano escolhido. O nome é mantido por compatibilidade
 * com a UI; a lógica de gateway fica no módulo billing.
 */
export const createStripeCheckout = actionClient
  .schema(z.object({ plan: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    const { checkoutUrl } = await makeCreateCheckoutSession().execute({
      userId: session?.user?.id,
      plan: parsedInput.plan,
      successUrl: `${appUrl}/dashboard`,
      cancelUrl: `${appUrl}/dashboard`,
    });

    return { checkoutUrl };
  });
