import { createHmac, timingSafeEqual } from "node:crypto";

export interface VerifyMetaSignatureParams {
  /** App secret do app Meta (WhatsApp). Quando ausente, a validação é pulada. */
  appSecret: string | undefined;
  /** Corpo CRU da requisição (exatamente como recebido). */
  rawBody: string;
  /** Conteúdo do header `X-Hub-Signature-256` (formato "sha256=<hex>"). */
  signatureHeader: string | null;
}

/**
 * Valida a assinatura `X-Hub-Signature-256` enviada pela Meta (HMAC-SHA256 do
 * corpo cru usando o app secret). Função pura e determinística — fácil de testar.
 *
 * - Sem app secret configurado → retorna `true` (modo dev; rota loga aviso).
 * - Header ausente/malformado ou hash divergente → `false`.
 * Comparação em tempo constante para evitar timing attacks.
 */
export const verifyMetaSignature = ({
  appSecret,
  rawBody,
  signatureHeader,
}: VerifyMetaSignatureParams): boolean => {
  if (!appSecret) return true;
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const provided = signatureHeader.slice("sha256=".length);
  const expected = createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");

  const providedBuffer = Buffer.from(provided, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (providedBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(providedBuffer, expectedBuffer);
};
