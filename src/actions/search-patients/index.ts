"use server";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeSearchPatients } from "@/core/modules/patients/infra/factories/make-patient-use-cases";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

import { searchPatientsSchema } from "./schema";

export const searchPatients = actionClient
  .schema(searchPatientsSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }

    const clinicId = resolveCurrentClinicId(actor);

    const patients = await makeSearchPatients().execute({
      actor,
      clinicId,
      query: parsedInput.query,
      limit: parsedInput.limit,
    });

    return { patients };
  });
