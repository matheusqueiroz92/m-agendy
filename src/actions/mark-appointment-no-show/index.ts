"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeMarkAppointmentNoShow } from "@/core/modules/scheduling/infra/factories/make-appointment-use-cases";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

/**
 * Delivery shell da marcação de falta. Regra no MarkAppointmentNoShowUseCase.
 */
export const markAppointmentNoShow = actionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }

    const clinicId = resolveCurrentClinicId(actor);

    await makeMarkAppointmentNoShow().execute({
      actor,
      clinicId,
      appointmentId: parsedInput.id,
    });

    revalidatePath("/appointments");

    return { success: true };
  });
