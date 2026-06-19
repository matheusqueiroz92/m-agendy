import { WhatsAppMessenger } from "../../application/ports/chatbot-ports";

/**
 * Envio genérico de mensagens de texto no WhatsApp (Meta Cloud API).
 * Sem credenciais, opera em modo dev (apenas registra no console).
 */
export class HttpWhatsAppMessenger implements WhatsAppMessenger {
  constructor(
    private readonly config: {
      apiUrl?: string;
      phoneNumberId?: string;
      accessToken?: string;
    } = {},
  ) {}

  async sendText(params: { to: string; body: string }): Promise<void> {
    const { apiUrl, phoneNumberId, accessToken } = this.config;

    if (!apiUrl || !phoneNumberId || !accessToken) {
      console.info(`[whatsapp:dev] -> ${params.to}: ${params.body}`);
      return;
    }

    const response = await fetch(`${apiUrl}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: params.to,
        type: "text",
        text: { body: params.body },
      }),
    });

    if (!response.ok) {
      throw new Error(`Falha ao enviar mensagem no WhatsApp: ${response.status}`);
    }
  }
}
