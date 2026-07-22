import { Authorizer } from "@/core/modules/iam/application/authorizer";

import { SendMarketingEmailUseCase } from "../../application/use-cases/send-marketing-email";
import { DrizzleMarketingAudience } from "../persistence/drizzle-marketing-audience";
import { NodemailerMarketingEmailGateway } from "../messaging/nodemailer-marketing-email-gateway";

export const makeSendMarketingEmail = () =>
  new SendMarketingEmailUseCase(
    new DrizzleMarketingAudience(),
    new NodemailerMarketingEmailGateway(),
    new Authorizer(),
  );
