import { WhatsAppMessenger } from "../../application/ports/chatbot-ports";
import { ClinicWhatsAppDirectory } from "../../application/ports/clinic-whatsapp-directory";

/**
 * Envio genérico de mensagens de texto no WhatsApp (Meta Cloud API).
 * Sem credenciais, opera em modo dev (apenas registra no console).
 *
 * MULTI-TENANT: quando `clinicId` vem no envio e há um `ClinicWhatsAppDirectory`
 * injetado, usa o número próprio da clínica; senão cai no `phoneNumberId`
 * global do `config` (fallback compartilhado).
 */
export class HttpWhatsAppMessenger implements WhatsAppMessenger {
  constructor(
    private readonly config: {
      apiUrl?: string;
      phoneNumberId?: string;
      accessToken?: string;
    } = {},
    private readonly directory?: ClinicWhatsAppDirectory,
  ) {}

  async sendText(params: { to: string; body: string; clinicId?: string }): Promise<void> {
    const { apiUrl, accessToken } = this.config;
    const clinicPhoneNumberId = params.clinicId
      ? await this.directory?.getPhoneNumberId(params.clinicId)
      : null;
    const phoneNumberId = clinicPhoneNumberId ?? this.config.phoneNumberId;

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
