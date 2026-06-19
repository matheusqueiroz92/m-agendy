"use server";

import { revalidatePath } from "next/cache";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeUpsertPrescription } from "@/core/modules/medical-records/infra/factories/make-prescription-use-cases";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

import { upsertPrescriptionSchema } from "./schema";

/** Delivery shell. Regra no UpsertPrescriptionUseCase. */
export const upsertPrescription = actionClient
  .schema(upsertPrescriptionSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }

    const clinicId = resolveCurrentClinicId(actor);

    await makeUpsertPrescription().execute({
      actor,
      clinicId,
      id: parsedInput.id,
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

    revalidatePath(`/medical-records/${parsedInput.patientId}`);
  });
