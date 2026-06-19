import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { makeSendAppointmentReminder } from "@/core/modules/scheduling/infra/factories/make-send-appointment-reminder";

/**
 * Endpoint chamado pela fila (QStash) quando chega a hora de um lembrete.
 * É outra "casca de delivery": valida a entrada e delega ao caso de uso.
 *
 * SEGURANÇA: em produção, valide a assinatura do QStash (cabeçalho
 * `Upstash-Signature`) com o `@upstash/qstash` Receiver antes de processar,
 * para garantir que a requisição veio mesmo da fila.
 */
const payloadSchema = z.object({
  appointmentId: z.string().uuid(),
  to: z.string().min(1),
  patientName: z.string().default(""),
  doctorName: z.string().optional(),
  scheduledAt: z.string().datetime(),
});

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
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
    to: parsed.data.to,
    patientName: parsed.data.patientName,
    doctorName: parsed.data.doctorName,
    scheduledAt: new Date(parsed.data.scheduledAt),
  });

  return NextResponse.json(result, { status: 200 });
}
