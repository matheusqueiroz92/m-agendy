import { createMarketingEmailTemplate, sendEmail } from "@/lib/email";

import {
  MarketingEmailRecipient,
} from "../../application/ports/marketing-audience";
import {
  MarketingEmailGateway,
  MarketingEmailMessage,
} from "../../application/ports/marketing-email-gateway";

/** Envia o e-mail de marketing via o mesmo transporte Nodemailer já usado
 * para verificação/redefinição de senha (`src/lib/email.ts`). */
export class NodemailerMarketingEmailGateway implements MarketingEmailGateway {
  async send(
    recipient: MarketingEmailRecipient,
    message: MarketingEmailMessage,
  ): Promise<void> {
    const { subject, html, text } = createMarketingEmailTemplate(
      recipient.name,
      message.subject,
      message.body,
    );

    await sendEmail({
      to: recipient.email,
      subject,
      html,
      text,
    });
  }
}
