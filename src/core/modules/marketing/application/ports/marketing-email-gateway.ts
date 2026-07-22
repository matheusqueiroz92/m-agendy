import { MarketingEmailRecipient } from "./marketing-audience";

export interface MarketingEmailMessage {
  subject: string;
  /** Corpo em texto simples digitado pelo admin; o gateway cuida do template/HTML. */
  body: string;
}

/** Envia um e-mail de marketing para um destinatário específico. */
export interface MarketingEmailGateway {
  send(
    recipient: MarketingEmailRecipient,
    message: MarketingEmailMessage,
  ): Promise<void>;
}
