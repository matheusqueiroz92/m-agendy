import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { verifyMetaSignature } from "./meta-signature";

const sign = (secret: string, body: string) =>
  "sha256=" + createHmac("sha256", secret).update(body, "utf8").digest("hex");

describe("verifyMetaSignature", () => {
  const appSecret = "super-secret";
  const rawBody = '{"entry":[]}';

  it("aceita assinatura válida", () => {
    expect(
      verifyMetaSignature({
        appSecret,
        rawBody,
        signatureHeader: sign(appSecret, rawBody),
      }),
    ).toBe(true);
  });

  it("rejeita assinatura inválida", () => {
    expect(
      verifyMetaSignature({
        appSecret,
        rawBody,
        signatureHeader: sign("outro-segredo", rawBody),
      }),
    ).toBe(false);
  });

  it("rejeita corpo adulterado", () => {
    expect(
      verifyMetaSignature({
        appSecret,
        rawBody: '{"entry":[1]}',
        signatureHeader: sign(appSecret, rawBody),
      }),
    ).toBe(false);
  });

  it("rejeita header ausente ou malformado", () => {
    expect(
      verifyMetaSignature({ appSecret, rawBody, signatureHeader: null }),
    ).toBe(false);
    expect(
      verifyMetaSignature({ appSecret, rawBody, signatureHeader: "abc" }),
    ).toBe(false);
  });

  it("pula validação em modo dev (sem app secret)", () => {
    expect(
      verifyMetaSignature({
        appSecret: undefined,
        rawBody,
        signatureHeader: null,
      }),
    ).toBe(true);
  });
});
