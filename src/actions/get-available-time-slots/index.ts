"use server";

import { z } from "zod";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeGetAvailableTimeSlots } from "@/core/modules/scheduling/infra/factories/make-get-available-time-slots";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  doctorId: z.string().uuid(),
  date: z.string().date(), // YYYY-MM-DD
});

/** Horários disponíveis para o painel da clínica (usuário autenticado). */
export const getAvailableTimeSlots = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }
    const clinicId = resolveCurrentClinicId(actor);

    return makeGetAvailableTimeSlots().execute({
      clinicId,
      doctorId: parsedInput.doctorId,
      date: parsedInput.date,
    });
  });
