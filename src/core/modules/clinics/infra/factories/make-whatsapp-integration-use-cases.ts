import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { DrizzleClinicNotifier } from "@/core/modules/scheduling/infra/messaging/drizzle-clinic-notifier";
import { DrizzleClinicWhatsAppDirectory } from "@/core/modules/scheduling/infra/messaging/drizzle-clinic-whatsapp-directory";
import { DrizzleClinicPlanProvider } from "@/core/modules/scheduling/infra/persistence/drizzle-clinic-plan-provider";

import { CompleteWhatsAppIntegrationRequestUseCase } from "../../application/use-cases/complete-whatsapp-integration-request";
import { ListWhatsAppIntegrationRequestsUseCase } from "../../application/use-cases/list-whatsapp-integration-requests";
import { RequestWhatsAppIntegrationUseCase } from "../../application/use-cases/request-whatsapp-integration";
import { DrizzleWhatsAppIntegrationRequestRepository } from "../persistence/drizzle-whatsapp-integration-request-repository";

const requestsRepo = () => new DrizzleWhatsAppIntegrationRequestRepository();
const whatsappDirectory = () => new DrizzleClinicWhatsAppDirectory();

export const makeRequestWhatsAppIntegration = () =>
  new RequestWhatsAppIntegrationUseCase(
    requestsRepo(),
    whatsappDirectory(),
    new DrizzleClinicPlanProvider(),
    new Authorizer(),
  );

export const makeListWhatsAppIntegrationRequests = () =>
  new ListWhatsAppIntegrationRequestsUseCase(requestsRepo(), new Authorizer());

export const makeCompleteWhatsAppIntegrationRequest = () =>
  new CompleteWhatsAppIntegrationRequestUseCase(
    requestsRepo(),
    whatsappDirectory(),
    new DrizzleClinicNotifier(),
    new Authorizer(),
  );
