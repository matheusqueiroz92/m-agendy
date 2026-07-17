import { Receiver } from "@upstash/qstash";

export interface VerifyQStashSignatureParams {
  /** `QSTASH_CURRENT_SIGNING_KEY`. Quando ausente (junto da próxima), pula a validação. */
  currentSigningKey: string | undefined;
  /** `QSTASH_NEXT_SIGNING_KEY` — a Upstash rotaciona as chaves; validar contra as duas evita quebrar durante a rotação. */
  nextSigningKey: string | undefined;
  /** Corpo CRU da requisição (exatamente como recebido). */
  rawBody: string;
  /** Conteúdo do header `Upstash-Signature`. */
  signatureHeader: string | null;
  /** URL completa da requisição — o QStash assina o destino junto com o corpo. */
  url: string;
}

/**
 * Valida o header `Upstash-Signature` enviado pelo QStash ao chamar
 * `/api/reminders/dispatch`, delegando ao `Receiver` oficial do SDK
 * `@upstash/qstash` em vez de reimplementar o esquema de assinatura (é um JWT
 * assinado pela Upstash, não um HMAC simples como o do WhatsApp).
 *
 * - Sem `currentSigningKey`/`nextSigningKey` configuradas → retorna `true`
 *   (modo dev; a rota loga um aviso). Mesma convenção de `verifyMetaSignature`.
 * - Header ausente, assinatura inválida/expirada, ou qualquer erro do
 *   `Receiver` → `false`.
 */
export const verifyQStashSignature = async ({
  currentSigningKey,
  nextSigningKey,
  rawBody,
  signatureHeader,
  url,
}: VerifyQStashSignatureParams): Promise<boolean> => {
  if (!currentSigningKey && !nextSigningKey) return true;
  if (!signatureHeader) return false;

  try {
    const receiver = new Receiver({
      currentSigningKey: currentSigningKey ?? "",
      nextSigningKey: nextSigningKey ?? currentSigningKey ?? "",
    });

    return await receiver.verify({ signature: signatureHeader, body: rawBody, url });
  } catch (error) {
    console.error("[qstash] falha ao validar assinatura:", error);
    return false;
  }
};
