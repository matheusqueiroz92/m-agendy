import {
  MarketingAudience,
  MarketingEmailRecipient,
} from "../ports/marketing-audience";
import {
  MarketingEmailGateway,
  MarketingEmailMessage,
} from "../ports/marketing-email-gateway";

export class InMemoryMarketingAudience implements MarketingAudience {
  constructor(private recipients: MarketingEmailRecipient[] = []) {}

  async listOptedInRecipients(): Promise<MarketingEmailRecipient[]> {
    return this.recipients;
  }
}

export class FakeMarketingEmailGateway implements MarketingEmailGateway {
  public readonly sent: {
    recipient: MarketingEmailRecipient;
    message: MarketingEmailMessage;
  }[] = [];

  /** E-mails nesta lista simulam falha de envio (ex.: SMTP fora do ar). */
  public failFor: string[] = [];

  async send(
    recipient: MarketingEmailRecipient,
    message: MarketingEmailMessage,
  ): Promise<void> {
    if (this.failFor.includes(recipient.email)) {
      throw new Error(`Falha simulada ao enviar para ${recipient.email}`);
    }
    this.sent.push({ recipient, message });
  }
}
