import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";

import { MarketingValidationError } from "../../domain/errors";
import { MarketingAudience } from "../ports/marketing-audience";
import { MarketingEmailGateway } from "../ports/marketing-email-gateway";

export interface SendMarketingEmailInput {
  actor: AuthenticatedActor | null;
  subject: string;
  body: string;
}

export interface SendMarketingEmailOutput {
  sentCount: number;
  failedCount: number;
}

/**
 * Dispara novidades/promoções por e-mail para quem deu opt-in (toggle
 * "Emails de Marketing" em Configurações). Restrito ao admin de plataforma.
 * Envio "best-effort" por destinatário: uma falha isolada não derruba o
 * disparo inteiro, só é contada em `failedCount`.
 */
export class SendMarketingEmailUseCase {
  constructor(
    private readonly audience: MarketingAudience,
    private readonly gateway: MarketingEmailGateway,
    private readonly authorizer: Authorizer,
  ) {}

  async execute(
    input: SendMarketingEmailInput,
  ): Promise<SendMarketingEmailOutput> {
    this.authorizer.assertPlatformAdmin(input.actor);

    const subject = input.subject.trim();
    const body = input.body.trim();

    if (!subject) {
      throw new MarketingValidationError("Informe o assunto do e-mail.");
    }
    if (!body) {
      throw new MarketingValidationError("Informe o conteúdo do e-mail.");
    }

    const recipients = await this.audience.listOptedInRecipients();

    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        await this.gateway.send(recipient, { subject, body });
        sentCount += 1;
      } catch (error) {
        failedCount += 1;
        console.error(
          `[marketing] falha ao enviar e-mail para ${recipient.email}:`,
          error,
        );
      }
    }

    return { sentCount, failedCount };
  }
}
