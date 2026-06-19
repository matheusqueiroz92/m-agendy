"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeDeletePrescription } from "@/core/modules/medical-records/infra/factories/make-prescription-use-cases";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

/** Delivery shell. Regra no DeletePrescriptionUseCase. */
export const deletePrescription = actionClient
  .schema(
    z.object({
      id: z.string().uuid(),
      patientId: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }

    const clinicId = resolveCurrentClinicId(actor);

    await makeDeletePrescription().execute({
      actor,
      clinicId,
      prescriptionId: parsedInput.id,
    });

    revalidatePath(`/medical-records/${parsedInput.patientId}`);
  });
