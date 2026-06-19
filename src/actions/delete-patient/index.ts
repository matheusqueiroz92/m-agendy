"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeDeletePatient } from "@/core/modules/patients/infra/factories/make-patient-use-cases";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

/**
 * Delivery shell do delete de paciente. Regra no DeletePatientUseCase.
 */
export const deletePatient = actionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }

    const clinicId = resolveCurrentClinicId(actor);

    await makeDeletePatient().execute({
      actor,
      clinicId,
      patientId: parsedInput.id,
    });

    revalidatePath("/patients");
  });
