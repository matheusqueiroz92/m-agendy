import { eq } from "drizzle-orm";

import { db } from "@/db";
import { clinicsTable } from "@/db/schema";

import { ClinicReminderPreference } from "../../application/ports/clinic-reminder-preference";

/** Lê o toggle "Lembretes de Agendamento" da clínica direto do Postgres. */
export class DrizzleClinicReminderPreference
  implements ClinicReminderPreference
{
  async areRemindersEnabled(clinicId: string): Promise<boolean> {
    const clinic = await db.query.clinicsTable.findFirst({
      where: eq(clinicsTable.id, clinicId),
      columns: { appointmentRemindersEnabled: true },
    });

    // Clínica não encontrada: não deveria acontecer em uso normal — mantém o
    // padrão (lembretes ligados) em vez de suprimir silenciosamente.
    return clinic?.appointmentRemindersEnabled ?? true;
  }
}
