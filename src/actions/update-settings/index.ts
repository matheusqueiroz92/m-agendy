"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { clinicsTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { updateSettingsSchema } from "./schema";

export const updateSettings = actionClient
  .schema(updateSettingsSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!session?.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    const {
      name,
      email,
      phoneNumber,
      clinicName,
      appointmentReminders,
      marketingEmails,
    } = parsedInput;

    // Atualizar dados do usuário (inclui o opt-in de e-mails de marketing —
    // preferência da pessoa, não da clínica).
    await db
      .update(usersTable)
      .set({
        name,
        email,
        phoneNumber: phoneNumber || null,
        marketingEmailsOptIn: marketingEmails,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, session.user.id));

    // Atualizar dados da clínica. O phone_number_id do WhatsApp não é mais
    // editável por aqui — só pela solicitação de integração (Configurações →
    // Integração WhatsApp), concluída pelo admin da plataforma. Lembretes de
    // agendamento são uma configuração operacional da clínica (afeta os
    // pacientes de todos), não da conta individual.
    await db
      .update(clinicsTable)
      .set({
        name: clinicName,
        appointmentRemindersEnabled: appointmentReminders,
        updatedAt: new Date(),
      })
      .where(eq(clinicsTable.id, session.user.clinic.id));

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true };
  });
