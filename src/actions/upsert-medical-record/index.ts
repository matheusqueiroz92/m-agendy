"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { medicalRecordsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertMedicalRecordSchema } from "./schema";

export const upsertMedicalRecord = actionClient
  .schema(upsertMedicalRecordSchema)
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

    // Garante que o paciente pertence à clínica do usuário.
    const patient = await db.query.patientsTable.findFirst({
      where: eq(patientsTable.id, parsedInput.patientId),
    });

    if (!patient || patient.clinicId !== session.user.clinic.id) {
      throw new Error("Paciente não encontrado");
    }

    await db
      .insert(medicalRecordsTable)
      .values({
        ...parsedInput,
        clinicId: session.user.clinic.id,
      })
      .onConflictDoUpdate({
        target: [medicalRecordsTable.patientId],
        set: {
          bloodType: parsedInput.bloodType,
          allergies: parsedInput.allergies,
          medicationsInUse: parsedInput.medicationsInUse,
          clinicalHistory: parsedInput.clinicalHistory,
          surgicalHistory: parsedInput.surgicalHistory,
          familyHistory: parsedInput.familyHistory,
          habits: parsedInput.habits,
          notes: parsedInput.notes,
          updatedAt: new Date(),
        },
      });

    revalidatePath(`/medical-records/${parsedInput.patientId}`);
  });
