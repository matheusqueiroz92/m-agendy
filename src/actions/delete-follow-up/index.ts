"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeDeleteFollowUp } from "@/core/modules/medical-records/infra/factories/make-follow-up-use-cases";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

/** Delivery shell. Regra no DeleteFollowUpUseCase. */
export const deleteFollowUp = actionClient
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

    await makeDeleteFollowUp().execute({
      actor,
      clinicId,
      followUpId: parsedInput.id,
    });

    revalidatePath(`/medical-records/${parsedInput.patientId}`);
  });
