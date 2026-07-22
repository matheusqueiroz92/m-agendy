import { eq } from "drizzle-orm";

import { db } from "@/db";
import { clinicsTable } from "@/db/schema";

import { ClinicWhatsAppDirectory } from "../../application/ports/clinic-whatsapp-directory";

/**
 * Adapter Drizzle da porta `ClinicWhatsAppDirectory`: busca o
 * `whatsapp_phone_number_id` cadastrado pela clínica em Configurações.
 */
export class DrizzleClinicWhatsAppDirectory implements ClinicWhatsAppDirectory {
  async getPhoneNumberId(clinicId: string): Promise<string | null> {
    const clinic = await db.query.clinicsTable.findFirst({
      where: eq(clinicsTable.id, clinicId),
      columns: { whatsappPhoneNumberId: true },
    });

    return clinic?.whatsappPhoneNumberId ?? null;
  }

  async setPhoneNumberId(clinicId: string, phoneNumberId: string): Promise<void> {
    await db
      .update(clinicsTable)
      .set({ whatsappPhoneNumberId: phoneNumberId, updatedAt: new Date() })
      .where(eq(clinicsTable.id, clinicId));
  }
}
