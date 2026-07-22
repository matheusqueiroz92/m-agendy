import { planHasFeature } from "@/core/modules/billing/domain/entitlements";
import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { ClinicPlanProvider } from "@/core/modules/scheduling/application/ports/clinic-plan-provider";
import { ClinicWhatsAppDirectory } from "@/core/modules/scheduling/application/ports/clinic-whatsapp-directory";
import { ForbiddenError, PlanLimitError } from "@/core/shared/domain/errors";

import { WhatsAppIntegrationRequest } from "../../domain/whatsapp-integration-request";
import { WhatsAppIntegrationRequestRepository } from "../ports/whatsapp-integration-request-repository";

export interface RequestWhatsAppIntegrationInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
}

export interface RequestWhatsAppIntegrationOutput {
  requestId: string;
}

/**
 * Caso de uso do lado da clínica: solicita a integração do PRÓPRIO número de
 * WhatsApp (planos Premium/Gold — ver `canUseOwnWhatsAppNumber`). A equipe do
 * M.Agendy conclui depois, manualmente, na tela admin
 * (`CompleteWhatsAppIntegrationRequestUseCase`).
 */
export class RequestWhatsAppIntegrationUseCase {
  constructor(
    private readonly requests: WhatsAppIntegrationRequestRepository,
    private readonly whatsapp: ClinicWhatsAppDirectory,
    private readonly plans: ClinicPlanProvider,
    private readonly authorizer: Authorizer,
  ) {}

  async execute(
    input: RequestWhatsAppIntegrationInput,
  ): Promise<RequestWhatsAppIntegrationOutput> {
    this.authorizer.assertCanManageClinic(input.actor, input.clinicId);

    const plan = await this.plans.getEffectivePlan(input.clinicId);
    if (!planHasFeature(plan, "canUseOwnWhatsAppNumber")) {
      throw new PlanLimitError(
        "Seu plano não permite integrar o número próprio de WhatsApp. Faça upgrade para Premium ou Gold.",
      );
    }

    const existingNumber = await this.whatsapp.getPhoneNumberId(input.clinicId);
    if (existingNumber) {
      throw new ForbiddenError(
        "Sua clínica já tem um número de WhatsApp próprio integrado.",
      );
    }

    const pending = await this.requests.findPendingByClinic(input.clinicId);
    if (pending) {
      throw new ForbiddenError(
        "Já existe uma solicitação de integração em andamento.",
      );
    }

    const request = WhatsAppIntegrationRequest.create({
      clinicId: input.clinicId,
    });
    await this.requests.save(request);

    return { requestId: request.id };
  }
}
