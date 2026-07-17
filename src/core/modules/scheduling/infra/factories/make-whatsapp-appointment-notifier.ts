import { DrizzleClinicWhatsAppDirectory } from "../messaging/drizzle-clinic-whatsapp-directory";
import { WhatsAppAppointmentNotifier } from "../messaging/whatsapp-appointment-notifier";

/**
 * Composition root do adapter de notificação de agendamento via WhatsApp
 * (Meta Cloud API). Centraliza a leitura das variáveis de ambiente para não
 * duplicar a mesma construção em cada factory de caso de uso que precisa
 * notificar o paciente (upsert/book/schedule/send-reminder appointment).
 *
 * Os nomes de template (`WHATSAPP_TEMPLATE_*`) precisam corresponder a
 * templates já aprovados no WhatsApp Manager — ver
 * docs/11-plano-notificacoes-whatsapp.md.
 *
 * Injeta o `DrizzleClinicWhatsAppDirectory` para que cada clínica com número
 * próprio configurado (Configurações → WhatsApp) envie a partir do seu
 * número; `WHATSAPP_PHONE_NUMBER_ID` continua sendo o fallback compartilhado.
 */
export const makeWhatsAppAppointmentNotifier = () =>
  new WhatsAppAppointmentNotifier(
    {
      apiUrl: process.env.WHATSAPP_API_URL,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      templateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE,
      confirmationTemplateName: process.env.WHATSAPP_TEMPLATE_CONFIRMATION_NAME,
      reminderTemplateName: process.env.WHATSAPP_TEMPLATE_REMINDER_NAME,
      cancellationTemplateName: process.env.WHATSAPP_TEMPLATE_CANCELLATION_NAME,
    },
    new DrizzleClinicWhatsAppDirectory(),
  );
