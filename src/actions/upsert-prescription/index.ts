"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { prescriptionsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { assertPatientAccess } from "../_helpers/medical-record-auth";
import { upsertPrescriptionSchema } from "./schema";

export const upsertPrescription = actionClient
  .schema(upsertPrescriptionSchema)
  .action(async ({ parsedInput }) => {
    const { clinicId } = await assertPatientAccess(parsedInput.patientId);

    if (parsedInput.id) {
      await db
        .update(prescriptionsTable)
        .set({
          doctorId: parsedInput.doctorId,
          attendanceId: parsedInput.attendanceId,
          medication: parsedInput.medication,
          dosage: parsedInput.dosage,
          frequency: parsedInput.frequency,
          duration: parsedInput.duration,
          instructions: parsedInput.instructions,
          date: parsedInput.date,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(prescriptionsTable.id, parsedInput.id),
            eq(prescriptionsTable.clinicId, clinicId),
          ),
        );
    } else {
      await db.insert(prescriptionsTable).values({
        clinicId,
        patientId: parsedInput.patientId,
        doctorId: parsedInput.doctorId,
        attendanceId: parsedInput.attendanceId,
        medication: parsedInput.medication,
        dosage: parsedInput.dosage,
        frequency: parsedInput.frequency,
        duration: parsedInput.duration,
        instructions: parsedInput.instructions,
        date: parsedInput.date,
      });
    }

    revalidatePath(`/medical-records/${parsedInput.patientId}`);
  });
