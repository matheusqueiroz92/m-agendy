"use server";

import { headers } from "next/headers";
import Stripe from "stripe";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

// Se houver mais de um plano, devem ser recebido um plan como parâmetro em um schema
// Dessa forma, criaria uma session para cada plano

export const createStripeCheckout = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not found");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });

  const { id: sessionId } = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    subscription_data: {
      metadata: {
        userId: session.user.id,
        // plan: "premium",
      },
    },
    line_items: [
      {
        price: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID,
        quantity: 1,
      },
    ],
  });

  return {
    sessionId,
  };
});
