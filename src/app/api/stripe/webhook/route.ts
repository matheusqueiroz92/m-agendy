import { NextResponse } from "next/server";

import { makeHandleBillingWebhook } from "@/core/modules/billing/infra/factories/make-billing";

/**
 * Webhook de cobrança. Casca de delivery: repassa corpo cru + assinatura ao
 * caso de uso, que usa o gateway ativo para validar e traduzir o evento.
 *
 * O path /api/stripe/webhook é mantido para não exigir reconfiguração no
 * provedor atual; ao adotar outro gateway, basta apontar o webhook dele para cá
 * (ou criar um path equivalente) — o handler é agnóstico.
 */
export const POST = async (request: Request) => {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  await makeHandleBillingWebhook().execute({ rawBody, signature });

  return NextResponse.json({ received: true });
};
