import dayjs from "dayjs";

import {
  AppointmentNotifier,
  AppointmentReminderNotification,
  AppointmentScheduledNotification,
} from "../../application/ports/appointment-notifier";

/**
 * Adapter de mensageria (driven adapter) que implementa a porta
 * AppointmentNotifier via WhatsApp (Meta Cloud API).
 *
 * O domínio não conhece o provedor — trocar de provedor é trocar este arquivo.
 * Sem credenciais configuradas, opera em modo dev (apenas registra no console).
 *
 * Em produção, recomenda-se enfileirar o envio (retentativa/desacoplamento) em
 * vez de enviar de forma síncrona aqui.
 */
export class WhatsAppAppointmentNotifier implements AppointmentNotifier {
  constructor(
    private readonly config: {
      apiUrl?: string;
      phoneNumberId?: string;
      accessToken?: string;
    } = {},
  ) {}

  async notifyScheduled(
    notification: AppointmentScheduledNotification,
  ): Promise<void> {
    const when = dayjs(notification.scheduledAt).format("DD/MM/YYYY [às] HH:mm");
    const message = `Olá${notification.patientName ? `, ${notification.patientName}` : ""}! Sua consulta${
      notification.doctorName ? ` com ${notification.doctorName}` : ""
    } foi agendada para ${when}. Responda CONFIRMAR para confirmar sua presença.`;

    await this.send(notification.to, message);
  }

  async notifyReminder(
    notification: AppointmentReminderNotification,
  ): Promise<void> {
    const when = dayjs(notification.scheduledAt).format("DD/MM/YYYY [às] HH:mm");
    const message = `Lembrete${notification.patientName ? `, ${notification.patientName}` : ""}: sua consulta${
      notification.doctorName ? ` com ${notification.doctorName}` : ""
    } é em ${when}. Responda CONFIRMAR para confirmar sua presença.`;

    await this.send(notification.to, message);
  }

  /** Envio efetivo (ou modo dev). Centraliza a chamada à API para os dois tipos. */
  private async send(to: string, message: string): Promise<void> {
    const { apiUrl, phoneNumberId, accessToken } = this.config;

    // Sem credenciais configuradas, apenas registra (modo desenvolvimento).
    if (!apiUrl || !phoneNumberId || !accessToken) {
      console.info(`[whatsapp:dev] -> ${to}: ${message}`);
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
        type: "text",
        text: { body: message },
      }),
    });

    if (!response.ok) {
      throw new Error(`Falha ao enviar mensagem no WhatsApp: ${response.status}`);
    }
  }
}
