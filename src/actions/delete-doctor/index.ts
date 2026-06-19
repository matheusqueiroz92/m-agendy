"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeDeleteProfessional } from "@/core/modules/professionals/infra/factories/make-professional-use-cases";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

/**
 * Delivery shell do delete de profissional. Regra no DeleteProfessionalUseCase.
 */
export const deleteDoctor = actionClient
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

    await makeDeleteProfessional().execute({
      actor,
      clinicId,
      professionalId: parsedInput.id,
    });

    revalidatePath("/doctors");
  });
