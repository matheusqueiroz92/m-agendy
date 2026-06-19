"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { makeDeleteClinic } from "@/core/modules/clinics/infra/factories/make-admin-clinic-use-cases";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({ clinicId: z.string().min(1) });

export const adminDeleteClinic = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) throw new UnauthorizedError();

    await makeDeleteClinic().execute({ actor, clinicId: parsedInput.clinicId });
    revalidatePath("/platform/clinics");
  });
