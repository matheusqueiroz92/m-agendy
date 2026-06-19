import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";

import {
  NotificationReader,
  NotificationView,
} from "../ports/notification-reader";

export interface ViewClinicNotificationsInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
}

/**
 * Lista as notificações da clínica e as marca como lidas (visualizar = ler).
 * Exige que o ator seja membro da clínica.
 */
export class ViewClinicNotificationsUseCase {
  constructor(
    private readonly reader: NotificationReader,
    private readonly authorizer: Authorizer,
  ) {}

  async execute(
    input: ViewClinicNotificationsInput,
  ): Promise<NotificationView[]> {
    this.authorizer.assertMemberOfClinic(input.actor, input.clinicId);

    const items = await this.reader.listByClinic(input.clinicId);
    await this.reader.markAllRead(input.clinicId);

    return items;
  }
}
