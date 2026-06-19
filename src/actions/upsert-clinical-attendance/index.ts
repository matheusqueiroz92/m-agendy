"use server";

import { revalidatePath } from "next/cache";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeUpsertClinicalAttendance } from "@/core/modules/medical-records/infra/factories/make-clinical-attendance-use-cases";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

import { upsertClinicalAttendanceSchema } from "./schema";

/** Delivery shell. Regra no UpsertClinicalAttendanceUseCase. */
export const upsertClinicalAttendance = actionClient
  .schema(upsertClinicalAttendanceSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }

    const clinicId = resolveCurrentClinicId(actor);

    await makeUpsertClinicalAttendance().execute({
      actor,
      clinicId,
      id: parsedInput.id,
      patientId: parsedInput.patientId,
      doctorId: parsedInput.doctorId,
      appointmentId: parsedInput.appointmentId,
      date: parsedInput.date,
      chiefComplaint: parsedInput.chiefComplaint,
      historyOfPresentIllness: parsedInput.historyOfPresentIllness,
      physicalExam: parsedInput.physicalExam,
      conduct: parsedInput.conduct,
      notes: parsedInput.notes,
    });

    revalidatePath(`/medical-records/${parsedInput.patientId}`);
  });
