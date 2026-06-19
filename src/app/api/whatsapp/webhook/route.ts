import { NextRequest, NextResponse } from "next/server";

import { makeConfirmAppointmentFromWhatsApp } from "@/core/modules/scheduling/infra/factories/make-confirm-appointment-from-whatsapp";
import { makeHandleChatbotMessage } from "@/core/modules/scheduling/infra/factories/make-handle-chatbot-message";
import { verifyMetaSignature } from "@/core/shared/security/meta-signature";

/**
 * Webhook de entrada do WhatsApp (Meta Cloud API).
 *
 * GET  → verificação do webhook (handshake do Meta).
 * POST → mensagens recebidas:
 *        - "CONFIRMAR/SIM/OK" → confirma a próxima consulta pendente e avisa a clínica.
 *        - demais textos      → encaminha ao chatbot de agendamento.
 *
 * SEGURANÇA: a assinatura `X-Hub-Signature-256` é validada contra o app secret
 * (WHATSAPP_APP_SECRET). Sem o segredo configurado, opera em modo dev (sem
 * validação) e registra um aviso.
 */
const CONFIRM_WORDS = ["confirmar", "confirmado", "sim", "ok"];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

interface IncomingMessage {
  from?: string;
  type?: string;
  text?: { body?: string };
}

interface InboundMessage {
  message: IncomingMessage;
  phoneNumberId?: string;
}

const isConfirmation = (text: string): boolean =>
  CONFIRM_WORDS.some((word) => text === word);

export async function POST(request: NextRequest) {
  // Corpo CRU é necessário para validar a assinatura antes de confiar no payload.
  const rawBody = await request.text();

  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    console.warn(
      "[whatsapp] WHATSAPP_APP_SECRET ausente: webhook sem validação de assinatura (modo dev).",
    );
  }

  const isValid = verifyMetaSignature({
    appSecret,
    rawBody,
    signatureHeader: request.headers.get("x-hub-signature-256"),
  });

  if (!isValid) {
    console.error("[whatsapp] assinatura do webhook inválida; ignorando.");
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ received: true });
  }

  const entries = (body as { entry?: unknown[] })?.entry ?? [];
  const inbound: InboundMessage[] = [];
  for (const entry of entries) {
    const changes = (entry as { changes?: unknown[] })?.changes ?? [];
    for (const change of changes) {
      const value = (
        change as {
          value?: {
            messages?: IncomingMessage[];
            metadata?: { phone_number_id?: string };
          };
        }
      )?.value;
      const phoneNumberId = value?.metadata?.phone_number_id;
      if (value?.messages) {
        for (const message of value.messages) {
          inbound.push({ message, phoneNumberId });
        }
      }
    }
  }

  const confirmUseCase = makeConfirmAppointmentFromWhatsApp();
  const chatbot = makeHandleChatbotMessage();

  for (const { message, phoneNumberId } of inbound) {
    if (message.type !== "text" || !message.from) continue;
    const raw = message.text?.body ?? "";
    const normalized = raw.trim().toLowerCase();

    try {
      if (isConfirmation(normalized)) {
        await confirmUseCase.execute({ fromPhone: message.from });
      } else {
        await chatbot.execute({
          fromPhone: message.from,
          text: raw,
          phoneNumberId,
        });
      }
    } catch (error) {
      console.error("[whatsapp] falha ao processar mensagem:", error);
    }
  }

  // O Meta exige 200 para não reenviar o evento.
  return NextResponse.json({ received: true });
}
