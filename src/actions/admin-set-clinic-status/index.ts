"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { makeSetClinicStatus } from "@/core/modules/clinics/infra/factories/make-admin-clinic-use-cases";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  clinicId: z.string().min(1),
  status: z.enum(["active", "blocked"]),
  reason: z.string().optional(),
});

export const adminSetClinicStatus = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) throw new UnauthorizedError();

    await makeSetClinicStatus().execute({
      actor,
      clinicId: parsedInput.clinicId,
      status: parsedInput.status,
      reason: parsedInput.reason,
    });
    revalidatePath("/platform/clinics");
  });
