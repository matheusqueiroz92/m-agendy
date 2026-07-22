"use server";

import { makeSendMarketingEmail } from "@/core/modules/marketing/infra/factories/make-send-marketing-email";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

import { sendMarketingEmailSchema } from "./schema";

/**
 * Casca de delivery. Regra no SendMarketingEmailUseCase: restrito ao admin de
 * plataforma; envia só para quem deu opt-in ("Emails de Marketing" em
 * Configurações).
 */
export const sendMarketingEmail = actionClient
  .schema(sendMarketingEmailSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) throw new UnauthorizedError();

    return makeSendMarketingEmail().execute({
      actor,
      subject: parsedInput.subject,
      body: parsedInput.body,
    });
  });
