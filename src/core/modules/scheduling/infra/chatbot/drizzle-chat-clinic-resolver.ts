import { eq } from "drizzle-orm";

import { db } from "@/db";
import { clinicsTable } from "@/db/schema";

import { ChatClinicResolver } from "../../application/ports/chatbot-ports";

/**
 * Resolve a clínica dona do número que recebeu a mensagem.
 *
 * Multi-tenant: procura a clínica cujo `whatsapp_phone_number_id` corresponde ao
 * `phone_number_id` do webhook. Sem correspondência (ou id ausente), retorna
 * `null` — o chatbot de agendamento por conversa nova é restrito a clínicas
 * com número próprio configurado, porque no número compartilhado não há como
 * saber com segurança de qual clínica é uma conversa nova (ver
 * docs/11-plano-notificacoes-whatsapp.md). Isso NÃO afeta a confirmação de
 * presença por resposta (`ConfirmAppointmentFromWhatsAppUseCase`), que
 * resolve a clínica pelo agendamento já existente, não pelo número.
 */
export class DrizzleChatClinicResolver implements ChatClinicResolver {
  async resolveInboundClinicId(params: {
    phoneNumberId?: string | null;
  }): Promise<string | null> {
    if (!params.phoneNumberId) {
      return null;
    }

    const clinic = await db.query.clinicsTable.findFirst({
      where: eq(clinicsTable.whatsappPhoneNumberId, params.phoneNumberId),
      columns: { id: true },
    });

    return clinic?.id ?? null;
  }
}
