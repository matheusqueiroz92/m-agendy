"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { makeSetClinicPlanOverride } from "@/core/modules/clinics/infra/factories/make-admin-clinic-use-cases";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  clinicId: z.string().min(1),
  // "" ou ausente = remover o override.
  planOverride: z.string().optional(),
  // ISO date (yyyy-mm-dd) opcional.
  expiresAt: z.string().optional(),
});

export const adminSetClinicPlan = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) throw new UnauthorizedError();

    const plan = parsedInput.planOverride?.trim() || null;
    const expiresAt =
      plan && parsedInput.expiresAt ? new Date(parsedInput.expiresAt) : null;

    await makeSetClinicPlanOverride().execute({
      actor,
      clinicId: parsedInput.clinicId,
      planOverride: plan,
      expiresAt,
    });
    revalidatePath("/platform/clinics");
  });
