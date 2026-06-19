import { eq } from "drizzle-orm";

import { db } from "@/db";
import { clinicsTable } from "@/db/schema";

import { ChatClinicResolver } from "../../application/ports/chatbot-ports";

/**
 * Resolve a clínica dona do número que recebeu a mensagem.
 *
 * Multi-tenant: procura a clínica cujo `whatsapp_phone_number_id` corresponde ao
 * `phone_number_id` do webhook. Se não houver correspondência (ou o id não veio),
 * cai no padrão por env WHATSAPP_DEFAULT_CLINIC_ID — preserva o comportamento
 * anterior enquanto nem toda clínica tem número próprio configurado.
 */
export class DrizzleChatClinicResolver implements ChatClinicResolver {
  async resolveInboundClinicId(params: {
    phoneNumberId?: string | null;
  }): Promise<string | null> {
    if (params.phoneNumberId) {
      const clinic = await db.query.clinicsTable.findFirst({
        where: eq(clinicsTable.whatsappPhoneNumberId, params.phoneNumberId),
        columns: { id: true },
      });
      if (clinic) return clinic.id;
    }

    return process.env.WHATSAPP_DEFAULT_CLINIC_ID ?? null;
  }
}
