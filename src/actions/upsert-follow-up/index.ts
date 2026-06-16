"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { followUpsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { assertPatientAccess } from "../_helpers/medical-record-auth";
import { upsertFollowUpSchema } from "./schema";

export const upsertFollowUp = actionClient
  .schema(upsertFollowUpSchema)
  .action(async ({ parsedInput }) => {
    const { clinicId } = await assertPatientAccess(parsedInput.patientId);

    if (parsedInput.id) {
      await db
        .update(followUpsTable)
        .set({
          title: parsedInput.title,
          description: parsedInput.description,
          status: parsedInput.status,
          scheduledDate: parsedInput.scheduledDate,
          completedDate: parsedInput.completedDate,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(followUpsTable.id, parsedInput.id),
            eq(followUpsTable.clinicId, clinicId),
          ),
        );
    } else {
      await db.insert(followUpsTable).values({
        clinicId,
        patientId: parsedInput.patientId,
        title: parsedInput.title,
        description: parsedInput.description,
        status: parsedInput.status,
        scheduledDate: parsedInput.scheduledDate,
        completedDate: parsedInput.completedDate,
      });
    }

    revalidatePath(`/medical-records/${parsedInput.patientId}`);
  });
