"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeUpsertAppointment } from "@/core/modules/scheduling/infra/factories/make-appointment-use-cases";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  appointmentPriceInCents: z.number().positive(),
  date: z.date(),
  time: z.string().min(1),
  type: z.enum(["consultation", "return_visit"]).default("consultation"),
});

/**
 * Delivery shell do agendamento (painel). Combina data + horário e delega ao
 * UpsertAppointmentUseCase, que detém a regra (autorização, conflito, tenant).
 */
export const upsertAppointment = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }

    const clinicId = resolveCurrentClinicId(actor);
    const session = await auth.api.getSession({ headers: await headers() });

    const [hours, minutes] = parsedInput.time.split(":").map(Number);
    const scheduledAt = new Date(parsedInput.date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    const result = await makeUpsertAppointment().execute({
      actor,
      clinicId,
      plan: session?.user?.plan ?? null,
      id: parsedInput.id,
      patientId: parsedInput.patientId,
      doctorId: parsedInput.doctorId,
      scheduledAt,
      priceInCents: parsedInput.appointmentPriceInCents,
      type: parsedInput.type,
    });

    revalidatePath("/appointments");
    revalidatePath("/dashboard");

    return { appointmentId: result.appointmentId };
  });
