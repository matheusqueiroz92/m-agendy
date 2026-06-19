"use server";

import { revalidatePath } from "next/cache";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeUpsertFollowUp } from "@/core/modules/medical-records/infra/factories/make-follow-up-use-cases";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

import { upsertFollowUpSchema } from "./schema";

/** Delivery shell. Regra no UpsertFollowUpUseCase. */
export const upsertFollowUp = actionClient
  .schema(upsertFollowUpSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }

    const clinicId = resolveCurrentClinicId(actor);

    await makeUpsertFollowUp().execute({
      actor,
      clinicId,
      id: parsedInput.id,
      patientId: parsedInput.patientId,
      title: parsedInput.title,
      description: parsedInput.description,
      status: parsedInput.status,
      scheduledDate: parsedInput.scheduledDate,
      completedDate: parsedInput.completedDate,
    });

    revalidatePath(`/medical-records/${parsedInput.patientId}`);
  });
