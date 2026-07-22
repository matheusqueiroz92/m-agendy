"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { makeRequestWhatsAppIntegration } from "@/core/modules/clinics/infra/factories/make-whatsapp-integration-use-cases";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  clinicId: z.string().min(1),
});

/**
 * Casca de delivery. Regra no RequestWhatsAppIntegrationUseCase: gestor da
 * clínica, plano Premium/Gold, sem número próprio nem solicitação pendente.
 */
export const requestWhatsAppIntegration = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) throw new UnauthorizedError();

    await makeRequestWhatsAppIntegration().execute({
      actor,
      clinicId: parsedInput.clinicId,
    });

    revalidatePath("/settings");
  });
