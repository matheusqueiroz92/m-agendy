"use server";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeCountUnreadNotifications } from "@/core/modules/notifications/infra/factories/make-count-unread-notifications";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

/** Delivery shell. Conta notificações não lidas para o badge da navegação. */
export const countUnreadNotifications = actionClient.action(async () => {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    throw new UnauthorizedError();
  }

  const clinicId = resolveCurrentClinicId(actor);
  const count = await makeCountUnreadNotifications().execute({
    actor,
    clinicId,
  });

  return { count };
});
