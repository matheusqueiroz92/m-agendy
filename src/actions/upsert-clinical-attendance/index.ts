"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clinicalAttendancesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { assertPatientAccess } from "../_helpers/medical-record-auth";
import { upsertClinicalAttendanceSchema } from "./schema";

export const upsertClinicalAttendance = actionClient
  .schema(upsertClinicalAttendanceSchema)
  .action(async ({ parsedInput }) => {
    const { clinicId } = await assertPatientAccess(parsedInput.patientId);

    if (parsedInput.id) {
      await db
        .update(clinicalAttendancesTable)
        .set({
          doctorId: parsedInput.doctorId,
          appointmentId: parsedInput.appointmentId,
          date: parsedInput.date,
          chiefComplaint: parsedInput.chiefComplaint,
          historyOfPresentIllness: parsedInput.historyOfPresentIllness,
          physicalExam: parsedInput.physicalExam,
          conduct: parsedInput.conduct,
          notes: parsedInput.notes,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(clinicalAttendancesTable.id, parsedInput.id),
            eq(clinicalAttendancesTable.clinicId, clinicId),
          ),
        );
    } else {
      await db.insert(clinicalAttendancesTable).values({
        clinicId,
        patientId: parsedInput.patientId,
        doctorId: parsedInput.doctorId,
        appointmentId: parsedInput.appointmentId,
        date: parsedInput.date,
        chiefComplaint: parsedInput.chiefComplaint,
        historyOfPresentIllness: parsedInput.historyOfPresentIllness,
        physicalExam: parsedInput.physicalExam,
        conduct: parsedInput.conduct,
        notes: parsedInput.notes,
      });
    }

    revalidatePath(`/medical-records/${parsedInput.patientId}`);
  });
