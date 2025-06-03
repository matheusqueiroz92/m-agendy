"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

const deleteAppointmentSchema = z.object({
  id: z.string().uuid(),
});

const actionClient = createSafeActionClient();

export const deleteAppointment = actionClient
  .schema(deleteAppointmentSchema)
  .action(async ({ parsedInput: { id } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/auth");
    }

    if (!session?.user?.clinic) {
      redirect("/clinic-form");
    }

    await db.delete(appointmentsTable).where(eq(appointmentsTable.id, id));

    revalidatePath("/appointments");

    return { success: true };
  });
