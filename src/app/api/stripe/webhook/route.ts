import { NextResponse } from "next/server";

import { makeHandleBillingWebhook } from "@/core/modules/billing/infra/factories/make-billing";

/**
 * Webhook de cobrança. Casca de delivery: repassa corpo cru + assinatura ao
 * caso de uso, que usa o gateway ativo para validar e traduzir o evento.
 *
 * O path /api/stripe/webhook é mantido para não exigir reconfiguração no
 * provedor atual; ao adotar outro gateway, basta apontar o webhook dele para cá
 * (ou criar um path equivalente) — o handler é agnóstico.
 *
 * SEGURANÇA: assinatura inválida/ausente (ou payload que o gateway rejeite)
 * vira 400 aqui — sem o try/catch, o erro do gateway subiria sem tratamento e
 * o Next.js responderia 500, fazendo a Stripe reter isso como falha do nosso
 * lado e reenviar o evento indefinidamente.
 */
export const POST = async (request: Request) => {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  try {
    await makeHandleBillingWebhook().execute({ rawBody, signature });
  } catch (error) {
    console.error("[stripe webhook] assinatura ou payload inválido:", error);
    return NextResponse.json(
      { error: "Invalid signature or payload" },
      { status: 400 },
    );
  }

  return NextResponse.json({ received: true });
};
