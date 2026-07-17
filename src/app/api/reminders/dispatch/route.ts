import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { makeSendAppointmentReminder } from "@/core/modules/scheduling/infra/factories/make-send-appointment-reminder";
import { verifyQStashSignature } from "@/core/shared/security/qstash-signature";

/**
 * Endpoint chamado pela fila (QStash) quando chega a hora de um lembrete.
 * É outra "casca de delivery": valida a assinatura, valida a entrada e
 * delega ao caso de uso.
 *
 * SEGURANÇA: o header `Upstash-Signature` é validado contra
 * `QSTASH_CURRENT_SIGNING_KEY`/`QSTASH_NEXT_SIGNING_KEY` via `verifyQStashSignature`.
 * Sem essas chaves configuradas, opera em modo dev (sem validação) e registra
 * um aviso — mesma convenção usada no webhook do WhatsApp
 * (`WHATSAPP_APP_SECRET` ausente).
 */
const payloadSchema = z.object({
  appointmentId: z.string().uuid(),
  clinicId: z.string().uuid(),
  to: z.string().min(1),
  patientName: z.string().default(""),
  doctorName: z.string().optional(),
  scheduledAt: z.string().datetime(),
});

export async function POST(request: NextRequest) {
  // Corpo CRU é necessário para validar a assinatura antes de confiar no payload.
  const rawBody = await request.text();

  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!currentSigningKey && !nextSigningKey) {
    console.warn(
      "[qstash] QSTASH_CURRENT_SIGNING_KEY/QSTASH_NEXT_SIGNING_KEY ausentes: " +
        "endpoint de lembretes sem validação de assinatura (modo dev).",
    );
  }

  const isValid = await verifyQStashSignature({
    currentSigningKey,
    nextSigningKey,
    rawBody,
    signatureHeader: request.headers.get("upstash-signature"),
    url: request.url,
  });

  if (!isValid) {
    console.error("[qstash] assinatura inválida; recusando disparo de lembrete.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const useCase = makeSendAppointmentReminder();
  const result = await useCase.execute({
    appointmentId: parsed.data.appointmentId,
    clinicId: parsed.data.clinicId,
    to: parsed.data.to,
    patientName: parsed.data.patientName,
    doctorName: parsed.data.doctorName,
    scheduledAt: new Date(parsed.data.scheduledAt),
  });

  return NextResponse.json(result, { status: 200 });
}
