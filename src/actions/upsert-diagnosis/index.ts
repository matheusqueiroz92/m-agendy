"use server";

import { revalidatePath } from "next/cache";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeUpsertDiagnosis } from "@/core/modules/medical-records/infra/factories/make-diagnosis-use-cases";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

import { upsertDiagnosisSchema } from "./schema";

/** Delivery shell. Regra no UpsertDiagnosisUseCase. */
export const upsertDiagnosis = actionClient
  .schema(upsertDiagnosisSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }

    const clinicId = resolveCurrentClinicId(actor);

    await makeUpsertDiagnosis().execute({
      actor,
      clinicId,
      id: parsedInput.id,
      patientId: parsedInput.patientId,
      attendanceId: parsedInput.attendanceId,
      description: parsedInput.description,
      cid10Code: parsedInput.cid10Code,
      status: parsedInput.status,
      date: parsedInput.date,
      notes: parsedInput.notes,
    });

    revalidatePath(`/medical-records/${parsedInput.patientId}`);
  });
