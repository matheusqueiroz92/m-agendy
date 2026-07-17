import dayjs from "dayjs";

import {
  AppointmentCancelledNotification,
  AppointmentNotifier,
  AppointmentReminderNotification,
  AppointmentScheduledNotification,
} from "../../application/ports/appointment-notifier";

export interface WhatsAppAppointmentNotifierConfig {
  apiUrl?: string;
  phoneNumberId?: string;
  accessToken?: string;
  /** Código de idioma do template na Meta (ex.: "pt_BR"). Default "pt_BR". */
  templateLanguage?: string;
  /** Nome do template aprovado no WhatsApp Manager para a confirmação imediata. */
  confirmationTemplateName?: string;
  /** Nome do template aprovado no WhatsApp Manager para o lembrete. */
  reminderTemplateName?: string;
  /** Nome do template aprovado no WhatsApp Manager para o aviso de cancelamento. */
  cancellationTemplateName?: string;
}

/**
 * Adapter de mensageria (driven adapter) que implementa a porta
 * AppointmentNotifier via WhatsApp (Meta Cloud API).
 *
 * O domínio não conhece o provedor — trocar de provedor é trocar este arquivo.
 * Sem credenciais ou sem o nome do template configurado, opera em modo dev
 * (apenas registra no console).
 *
 * IMPORTANTE: usa mensagens de TEMPLATE (`type: "template"`), não texto livre.
 * Confirmação e lembrete são iniciados pela clínica, geralmente fora da janela
 * de 24h de interação do paciente — a Graph API só entrega proativamente
 * mensagens de template previamente aprovadas pela Meta. Os templates
 * (`confirmationTemplateName`/`reminderTemplateName`) precisam já existir e
 * estar aprovados no WhatsApp Manager antes de configurar as variáveis de
 * ambiente correspondentes (ver docs/11-plano-notificacoes-whatsapp.md).
 *
 * Em produção, recomenda-se enfileirar o envio (retentativa/desacoplamento) em
 * vez de enviar de forma síncrona aqui.
 */
export class WhatsAppAppointmentNotifier implements AppointmentNotifier {
  constructor(
    private readonly config: WhatsAppAppointmentNotifierConfig = {},
  ) {}

  async notifyScheduled(
    notification: AppointmentScheduledNotification,
  ): Promise<void> {
    await this.sendTemplate({
      to: notification.to,
      templateName: this.config.confirmationTemplateName,
      params: this.buildParams(notification),
      devLabel: "confirmação",
    });
  }

  async notifyReminder(
    notification: AppointmentReminderNotification,
  ): Promise<void> {
    await this.sendTemplate({
      to: notification.to,
      templateName: this.config.reminderTemplateName,
      params: this.buildParams(notification),
      devLabel: "lembrete",
    });
  }

  async notifyCancelled(
    notification: AppointmentCancelledNotification,
  ): Promise<void> {
    await this.sendTemplate({
      to: notification.to,
      templateName: this.config.cancellationTemplateName,
      params: this.buildParams(notification),
      devLabel: "cancelamento",
    });
  }

  /** Monta os parâmetros posicionais do body do template: {{1}}, {{2}}, {{3}}. */
  private buildParams(
    notification: AppointmentScheduledNotification,
  ): [patientName: string, doctorName: string, when: string] {
    const when = dayjs(notification.scheduledAt).format("DD/MM/YYYY [às] HH:mm");
    return [
      notification.patientName?.trim() || "paciente",
      notification.doctorName?.trim() || "seu profissional",
      when,
    ];
  }

  /** Envio efetivo (ou modo dev). Centraliza a chamada à API para os dois tipos. */
  private async sendTemplate(params: {
    to: string;
    templateName?: string;
    params: string[];
    devLabel: string;
  }): Promise<void> {
    const { apiUrl, phoneNumberId, accessToken, templateLanguage } = this.config;
    const { to, templateName, devLabel } = params;

    // Sem credenciais ou sem o template configurado, apenas registra
    // (modo desenvolvimento) — degrada com elegância em vez de falhar.
    if (!apiUrl || !phoneNumberId || !accessToken || !templateName) {
      console.info(
        `[whatsapp:dev] ${devLabel} -> ${to}: template="${templateName ?? "(não configurado)"}" params=${JSON.stringify(params.params)}`,
      );
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
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLanguage ?? "pt_BR" },
          components: [
            {
              type: "body",
              parameters: params.params.map((text) => ({ type: "text", text })),
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Falha ao enviar template no WhatsApp: ${response.status}`);
    }
  }
}
