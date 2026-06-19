"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeDeleteAppointment } from "@/core/modules/scheduling/infra/factories/make-appointment-use-cases";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

/**
 * Delivery shell do delete de agendamento. Regra no DeleteAppointmentUseCase.
 */
export const deleteAppointment = actionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }

    const clinicId = resolveCurrentClinicId(actor);

    await makeDeleteAppointment().execute({
      actor,
      clinicId,
      appointmentId: parsedInput.id,
    });

    revalidatePath("/appointments");

    return { success: true };
  });
