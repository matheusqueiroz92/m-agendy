"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { diagnosesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { assertPatientAccess } from "../_helpers/medical-record-auth";

export const deleteDiagnosis = actionClient
  .schema(
    z.object({
      id: z.string().uuid(),
      patientId: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { clinicId } = await assertPatientAccess(parsedInput.patientId);

    await db
      .delete(diagnosesTable)
      .where(
        and(
          eq(diagnosesTable.id, parsedInput.id),
          eq(diagnosesTable.clinicId, clinicId),
        ),
      );

    revalidatePath(`/medical-records/${parsedInput.patientId}`);
  });
