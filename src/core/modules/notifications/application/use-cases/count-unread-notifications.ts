import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";

import { NotificationReader } from "../ports/notification-reader";

export interface CountUnreadNotificationsInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
}

/**
 * Conta as notificações não lidas da clínica (para o badge na navegação).
 * Exige membro da clínica — qualquer papel, inclusive recepção (staff).
 */
export class CountUnreadNotificationsUseCase {
  constructor(
    private readonly reader: NotificationReader,
    private readonly authorizer: Authorizer,
  ) {}

  async execute(input: CountUnreadNotificationsInput): Promise<number> {
    this.authorizer.assertMemberOfClinic(input.actor, input.clinicId);
    return this.reader.countUnread(input.clinicId);
  }
}
