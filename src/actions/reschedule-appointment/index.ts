"use server";

import { revalidatePath } from "next/cache";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeRescheduleAppointment } from "@/core/modules/scheduling/infra/factories/make-appointment-use-cases";
import { combineDateAndTimeInClinicTimezone } from "@/core/shared/domain/combine-date-and-time";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

import { rescheduleAppointmentSchema } from "../upsert-appointment/schema";

export const rescheduleAppointment = actionClient
  .schema(rescheduleAppointmentSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }

    const clinicId = resolveCurrentClinicId(actor);

    const scheduledAt = combineDateAndTimeInClinicTimezone(
      parsedInput.date,
      parsedInput.time,
    );

    const result = await makeRescheduleAppointment().execute({
      actor,
      clinicId,
      appointmentId: parsedInput.id,
      scheduledAt,
      durationInMinutes: parsedInput.durationInMinutes,
    });

    revalidatePath("/appointments");
    revalidatePath("/dashboard");

    return { appointmentId: result.appointmentId };
  });
