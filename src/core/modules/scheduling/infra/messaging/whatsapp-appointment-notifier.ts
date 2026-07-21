import { formatInClinicTimezone } from "@/core/shared/domain/combine-date-and-time";
import { toE164BR } from "@/core/shared/domain/phone-number";

import {
  AppointmentCancelledNotification,
  AppointmentNotifier,
  AppointmentReminderNotification,
  AppointmentScheduledNotification,
} from "../../application/ports/appointment-notifier";
import { ClinicWhatsAppDirectory } from "../../application/ports/clinic-whatsapp-directory";

export interface WhatsAppAppointmentNotifierConfig {
  apiUrl?: string;
  /** Número (phone_number_id) compartilhado, usado como fallback quando a
   * clínica não tem um número próprio cadastrado (ver `directory`). */
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
 *
 * MULTI-TENANT: se um `ClinicWhatsAppDirectory` for injetado, cada envio
 * resolve primeiro o número (`phone_number_id`) próprio da clínica; se ela não
 * tiver um cadastrado (ou nenhum diretório for injetado), usa o `phoneNumberId`
 * global do `config` como fallback — todas as clínicas compartilham o mesmo
 * número até configurarem o seu.
 */
export class WhatsAppAppointmentNotifier implements AppointmentNotifier {
  constructor(
    private readonly config: WhatsAppAppointmentNotifierConfig = {},
    private readonly directory?: ClinicWhatsAppDirectory,
  ) {}

  async notifyScheduled(
    notification: AppointmentScheduledNotification,
  ): Promise<void> {
    await this.sendTemplate({
      to: notification.to,
      clinicId: notification.clinicId,
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
      clinicId: notification.clinicId,
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
      clinicId: notification.clinicId,
      templateName: this.config.cancellationTemplateName,
      params: this.buildParams(notification),
      devLabel: "cancelamento",
    });
  }

  /** Número da clínica quando configurado, senão o compartilhado (fallback). */
  private async resolvePhoneNumberId(clinicId: string): Promise<string | undefined> {
    const clinicPhoneNumberId = await this.directory?.getPhoneNumberId(clinicId);
    return clinicPhoneNumberId ?? this.config.phoneNumberId;
  }

  /** Monta os parâmetros posicionais do body do template: {{1}}, {{2}}, {{3}}. */
  private buildParams(
    notification: AppointmentScheduledNotification,
  ): [patientName: string, doctorName: string, when: string] {
    const when = formatInClinicTimezone(
      notification.scheduledAt,
      "DD/MM/YYYY [às] HH:mm",
    );
    return [
      notification.patientName?.trim() || "paciente",
      notification.doctorName?.trim() || "seu profissional",
      when,
    ];
  }

  /** Envio efetivo (ou modo dev). Centraliza a chamada à API para os dois tipos. */
  private async sendTemplate(params: {
    to: string;
    clinicId: string;
    templateName?: string;
    params: string[];
    devLabel: string;
  }): Promise<void> {
    const { apiUrl, accessToken, templateLanguage } = this.config;
    const { to, clinicId, templateName, devLabel } = params;
    const phoneNumberId = await this.resolvePhoneNumberId(clinicId);

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
        to: toE164BR(to),
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
