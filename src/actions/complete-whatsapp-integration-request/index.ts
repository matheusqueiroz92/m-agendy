"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { makeCompleteWhatsAppIntegrationRequest } from "@/core/modules/clinics/infra/factories/make-whatsapp-integration-use-cases";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  requestId: z.string().min(1),
  phoneNumberId: z.string().trim().min(1, "Informe o phone_number_id."),
});

/**
 * Casca de delivery. Regra no CompleteWhatsAppIntegrationRequestUseCase:
 * restrito ao admin de plataforma; grava o número e avisa a clínica.
 */
export const completeWhatsAppIntegrationRequest = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) throw new UnauthorizedError();

    await makeCompleteWhatsAppIntegrationRequest().execute({
      actor,
      requestId: parsedInput.requestId,
      phoneNumberId: parsedInput.phoneNumberId,
    });

    revalidatePath("/platform/whatsapp-requests");
  });
