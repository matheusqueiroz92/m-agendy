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

const createAppointmentSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  appointmentPriceInCents: z.number().positive(),
  date: z.date(),
  time: z.string().min(1),
});

const actionClient = createSafeActionClient();

export const upsertAppointment = actionClient
  .schema(createAppointmentSchema)
  .action(
    async ({
      parsedInput: {
        id,
        patientId,
        doctorId,
        appointmentPriceInCents,
        date,
        time,
      },
    }) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        redirect("/auth");
      }

      if (!session?.user?.clinic) {
        redirect("/clinic-form");
      }

      // Combina a data com o horário para criar o timestamp completo
      const [hours, minutes] = time.split(":").map(Number);
      const appointmentDateTime = new Date(date);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      let appointment;

      if (id) {
        // Atualizar agendamento existente
        appointment = await db
          .update(appointmentsTable)
          .set({
            patientId,
            doctorId,
            clinicId: session.user.clinic.id,
            date: appointmentDateTime,
            appointmentPriceInCents,
            updatedAt: new Date(),
          })
          .where(eq(appointmentsTable.id, id))
          .returning();
      } else {
        // Criar novo agendamento
        appointment = await db
          .insert(appointmentsTable)
          .values({
            patientId,
            doctorId,
            clinicId: session.user.clinic.id,
            date: appointmentDateTime,
            appointmentPriceInCents,
          })
          .returning();
      }

      revalidatePath("/appointments");

      return { appointment: appointment[0] };
    },
  );
