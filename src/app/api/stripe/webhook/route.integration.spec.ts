import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { resetTestDatabase } from "@/core/shared/infra/testing/reset-test-database";

import { POST } from "./route";

const WEBHOOK_SECRET = "whsec_test_secret_de_integracao";
const WEBHOOK_URL = "http://localhost/api/stripe/webhook";

/**
 * Testes de integração da rota do webhook da Stripe. Foco na fronteira de
 * segurança: assinatura HMAC (`stripe-signature`) inválida ou ausente precisa
 * virar um 4xx limpo, nunca um 500 sem tratamento (a Stripe reenviaria o
 * evento indefinidamente achando que falhamos em processar).
 *
 * Usa `Stripe.webhooks.generateTestHeaderString`, o mesmo utilitário oficial
 * do SDK para gerar cabeçalhos de teste — não depende de rede.
 */
describe("POST /api/stripe/webhook (integração)", () => {
  const originalSecretKey = process.env.STRIPE_SECRET_KEY;
  const originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  beforeEach(async () => {
    await resetTestDatabase();
    process.env.STRIPE_SECRET_KEY = "sk_test_placeholder_para_construir_o_client";
    process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });

  afterEach(() => {
    process.env.STRIPE_SECRET_KEY = originalSecretKey;
    process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret;
  });

  const buildSignedRequest = (payload: string, secret = WEBHOOK_SECRET) => {
    const header = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret,
    });

    return new Request(WEBHOOK_URL, {
      method: "POST",
      body: payload,
      headers: { "stripe-signature": header },
    });
  };

  it("aceita assinatura válida (evento não tratado vira 'ignored')", async () => {
    // Tipo de evento fora do switch de handle-billing-webhook.ts → cai no
    // caso "ignored", sem chamar a API real da Stripe (sem rede no teste).
    const payload = JSON.stringify({
      id: "evt_test_1",
      type: "checkout.session.completed",
      data: { object: {} },
    });

    const res = await POST(buildSignedRequest(payload));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });
  });

  it("rejeita com 400 quando a assinatura foi gerada com outro segredo", async () => {
    const payload = JSON.stringify({ id: "evt_test_2", type: "checkout.session.completed" });

    const res = await POST(buildSignedRequest(payload, "whsec_segredo_errado"));

    expect(res.status).toBe(400);
  });

  it("rejeita com 400 quando o header de assinatura está ausente", async () => {
    const payload = JSON.stringify({ id: "evt_test_3", type: "checkout.session.completed" });

    const res = await POST(
      new Request(WEBHOOK_URL, { method: "POST", body: payload }),
    );

    expect(res.status).toBe(400);
  });

  it("rejeita com 400 quando o corpo foi adulterado após assinar", async () => {
    const payload = JSON.stringify({ id: "evt_test_4", type: "checkout.session.completed" });
    const header = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: WEBHOOK_SECRET,
    });

    const tamperedPayload = JSON.stringify({
      id: "evt_test_4",
      type: "checkout.session.completed",
      data: { object: { injected: true } },
    });

    const res = await POST(
      new Request(WEBHOOK_URL, {
        method: "POST",
        body: tamperedPayload,
        headers: { "stripe-signature": header },
      }),
    );

    expect(res.status).toBe(400);
  });
});
