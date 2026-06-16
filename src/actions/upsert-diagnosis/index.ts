"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { diagnosesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { assertPatientAccess } from "../_helpers/medical-record-auth";
import { upsertDiagnosisSchema } from "./schema";

export const upsertDiagnosis = actionClient
  .schema(upsertDiagnosisSchema)
  .action(async ({ parsedInput }) => {
    const { clinicId } = await assertPatientAccess(parsedInput.patientId);

    if (parsedInput.id) {
      await db
        .update(diagnosesTable)
        .set({
          description: parsedInput.description,
          cid10Code: parsedInput.cid10Code,
          status: parsedInput.status,
          date: parsedInput.date,
          notes: parsedInput.notes,
          attendanceId: parsedInput.attendanceId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(diagnosesTable.id, parsedInput.id),
            eq(diagnosesTable.clinicId, clinicId),
          ),
        );
    } else {
      await db.insert(diagnosesTable).values({
        clinicId,
        patientId: parsedInput.patientId,
        attendanceId: parsedInput.attendanceId,
        description: parsedInput.description,
        cid10Code: parsedInput.cid10Code,
        status: parsedInput.status,
        date: parsedInput.date,
        notes: parsedInput.notes,
      });
    }

    revalidatePath(`/medical-records/${parsedInput.patientId}`);
  });
