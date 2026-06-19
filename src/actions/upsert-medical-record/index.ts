"use server";

import { revalidatePath } from "next/cache";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeUpsertMedicalRecord } from "@/core/modules/medical-records/infra/factories/make-medical-record-use-cases";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

import { upsertMedicalRecordSchema } from "./schema";

/**
 * Delivery shell dos antecedentes. Regra (acesso, isolamento por clínica,
 * auditoria) no UpsertMedicalRecordUseCase.
 */
export const upsertMedicalRecord = actionClient
  .schema(upsertMedicalRecordSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }

    const clinicId = resolveCurrentClinicId(actor);

    await makeUpsertMedicalRecord().execute({
      actor,
      clinicId,
      ...parsedInput,
    });

    revalidatePath(`/medical-records/${parsedInput.patientId}`);
  });
