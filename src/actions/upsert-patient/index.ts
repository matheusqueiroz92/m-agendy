"use server";

import { revalidatePath } from "next/cache";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeUpsertPatient } from "@/core/modules/patients/infra/factories/make-patient-use-cases";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

import { upsertPatientSchema } from "./schema";

/**
 * Delivery shell: autentica, resolve a clínica atual e delega ao caso de uso.
 * Toda a regra (autorização, isolamento por clínica, auditoria) vive no
 * UpsertPatientUseCase.
 */
export const upsertPatient = actionClient
  .schema(upsertPatientSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }

    const clinicId = resolveCurrentClinicId(actor);

    await makeUpsertPatient().execute({
      actor,
      clinicId,
      ...parsedInput,
    });

    revalidatePath("/patients");
  });
