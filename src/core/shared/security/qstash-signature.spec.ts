import { beforeEach, describe, expect, it, vi } from "vitest";

import { verifyQStashSignature } from "./qstash-signature";

/**
 * O `Receiver` do `@upstash/qstash` assina/valida um JWT interno cujo formato
 * exato não é público de forma prática para reconstruir num teste (diferente
 * do HMAC simples do WhatsApp, que dá pra recomputar com `node:crypto`, ou da
 * Stripe, que expõe `generateTestHeaderString`). Por isso mockamos o SDK aqui:
 * o que este teste garante é a LÓGICA do nosso wrapper (modo dev, header
 * ausente, erro do Receiver vira rejeição) — não o algoritmo de assinatura em
 * si, que é responsabilidade do SDK oficial. Valide contra o QStash de
 * verdade (ou o CLI local da Upstash) antes de confiar em produção.
 *
 * `vi.mock` é hoisted pelo Vitest para o topo do módulo, então funciona mesmo
 * declarado depois do import acima.
 */
const verifyMock = vi.fn();
vi.mock("@upstash/qstash", () => ({
  Receiver: vi.fn().mockImplementation(() => ({ verify: verifyMock })),
}));

const baseParams = {
  rawBody: "{}",
  url: "http://localhost:3000/api/reminders/dispatch",
};

describe("verifyQStashSignature", () => {
  beforeEach(() => {
    verifyMock.mockReset();
  });

  it("modo dev: sem chaves configuradas, pula validação sem chamar o Receiver", async () => {
    const result = await verifyQStashSignature({
      ...baseParams,
      currentSigningKey: undefined,
      nextSigningKey: undefined,
      signatureHeader: null,
    });

    expect(result).toBe(true);
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it("rejeita quando o header de assinatura está ausente (mas há chaves configuradas)", async () => {
    const result = await verifyQStashSignature({
      ...baseParams,
      currentSigningKey: "key-atual",
      nextSigningKey: "key-proxima",
      signatureHeader: null,
    });

    expect(result).toBe(false);
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it("aceita quando o Receiver confirma a assinatura", async () => {
    verifyMock.mockResolvedValue(true);

    const result = await verifyQStashSignature({
      ...baseParams,
      currentSigningKey: "key-atual",
      nextSigningKey: "key-proxima",
      signatureHeader: "assinatura-valida",
    });

    expect(result).toBe(true);
    expect(verifyMock).toHaveBeenCalledWith({
      signature: "assinatura-valida",
      body: baseParams.rawBody,
      url: baseParams.url,
    });
  });

  it("rejeita quando o Receiver recusa a assinatura", async () => {
    verifyMock.mockResolvedValue(false);

    const result = await verifyQStashSignature({
      ...baseParams,
      currentSigningKey: "key-atual",
      nextSigningKey: "key-proxima",
      signatureHeader: "assinatura-invalida",
    });

    expect(result).toBe(false);
  });

  it("rejeita quando o Receiver lança erro (ex.: assinatura expirada/malformada)", async () => {
    verifyMock.mockRejectedValue(new Error("signature expired"));

    const result = await verifyQStashSignature({
      ...baseParams,
      currentSigningKey: "key-atual",
      nextSigningKey: "key-proxima",
      signatureHeader: "assinatura-expirada",
    });

    expect(result).toBe(false);
  });
});
