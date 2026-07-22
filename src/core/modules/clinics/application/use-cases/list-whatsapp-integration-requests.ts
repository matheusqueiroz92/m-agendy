import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";

import {
  WhatsAppIntegrationRequestListItem,
  WhatsAppIntegrationRequestRepository,
} from "../ports/whatsapp-integration-request-repository";

export interface ListWhatsAppIntegrationRequestsInput {
  actor: AuthenticatedActor | null;
}

/**
 * Caso de uso do lado admin: lista todas as solicitações de integração de
 * WhatsApp, para a fila de atendimento na tela admin da plataforma.
 */
export class ListWhatsAppIntegrationRequestsUseCase {
  constructor(
    private readonly requests: WhatsAppIntegrationRequestRepository,
    private readonly authorizer: Authorizer,
  ) {}

  async execute(
    input: ListWhatsAppIntegrationRequestsInput,
  ): Promise<WhatsAppIntegrationRequestListItem[]> {
    this.authorizer.assertPlatformAdmin(input.actor);
    return this.requests.listAll();
  }
}
