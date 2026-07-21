"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeUpsertAppointment } from "@/core/modules/scheduling/infra/factories/make-appointment-use-cases";
import { combineDateAndTimeInClinicTimezone } from "@/core/shared/domain/combine-date-and-time";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertAppointmentSchema } from "./schema";

/**
 * Delivery shell do agendamento (painel). Combina data + horário e delega ao
 * UpsertAppointmentUseCase, que detém a regra (autorização, conflito, tenant).
 */
export const upsertAppointment = actionClient
  .schema(upsertAppointmentSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }

    const clinicId = resolveCurrentClinicId(actor);
    const session = await auth.api.getSession({ headers: await headers() });

    const scheduledAt = combineDateAndTimeInClinicTimezone(
      parsedInput.date,
      parsedInput.time,
    );

    const result = await makeUpsertAppointment().execute({
      actor,
      clinicId,
      plan: session?.user?.plan ?? null,
      id: parsedInput.id,
      patientId: parsedInput.patientId,
      doctorId: parsedInput.doctorId,
      scheduledAt,
      durationInMinutes: parsedInput.durationInMinutes,
      priceInCents: parsedInput.appointmentPriceInCents,
      type: parsedInput.type,
    });

    revalidatePath("/appointments");
    revalidatePath("/dashboard");

    return { appointmentId: result.appointmentId };
  });
