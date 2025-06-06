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
      // As configurações de notificação e preferências poderiam ser salvas
      // em uma tabela separada de configurações, por enquanto vamos apenas
      // atualizar os dados básicos do usuário e clínica
      ...otherSettings
    } = parsedInput;

    // Atualizar dados do usuário
    await db
      .update(usersTable)
      .set({
        name,
        email,
        phoneNumber: phoneNumber || null,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, session.user.id));

    // Atualizar nome da clínica
    await db
      .update(clinicsTable)
      .set({
        name: clinicName,
        updatedAt: new Date(),
      })
      .where(eq(clinicsTable.id, session.user.clinic.id));

    // TODO: Implementar salvamento das outras configurações
    // em uma tabela de settings quando necessário
    console.log("Other settings:", otherSettings);

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true };
  });
