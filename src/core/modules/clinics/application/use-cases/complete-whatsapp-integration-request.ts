import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { ClinicNotifier } from "@/core/modules/scheduling/application/ports/clinic-notifier";
import { ClinicWhatsAppDirectory } from "@/core/modules/scheduling/application/ports/clinic-whatsapp-directory";
import { NotFoundError } from "@/core/shared/domain/errors";

import { WhatsAppIntegrationRequestRepository } from "../ports/whatsapp-integration-request-repository";

export interface CompleteWhatsAppIntegrationRequestInput {
  actor: AuthenticatedActor | null;
  requestId: string;
  phoneNumberId: string;
}

/**
 * Caso de uso do lado admin: conclui a solicitação de integração já com o
 * `phone_number_id` obtido no Meta Business Manager. Fluxo unificado — não há
 * etapa intermediária de "em andamento". Grava o número na clínica e avisa a
 * clínica in-app.
 */
export class CompleteWhatsAppIntegrationRequestUseCase {
  constructor(
    private readonly requests: WhatsAppIntegrationRequestRepository,
    private readonly whatsapp: ClinicWhatsAppDirectory,
    private readonly clinicNotifier: ClinicNotifier,
    private readonly authorizer: Authorizer,
  ) {}

  async execute(input: CompleteWhatsAppIntegrationRequestInput): Promise<void> {
    this.authorizer.assertPlatformAdmin(input.actor);

    const request = await this.requests.findById(input.requestId);
    if (!request) {
      throw new NotFoundError("Solicitação não encontrada.");
    }

    const completed = request.complete(input.phoneNumberId);
    await this.requests.save(completed);

    const phoneNumberId = completed.phoneNumberId!;
    await this.whatsapp.setPhoneNumberId(completed.clinicId, phoneNumberId);

    await this.clinicNotifier.notifyWhatsAppIntegrationCompleted({
      clinicId: completed.clinicId,
      phoneNumberId,
    });
  }
}
