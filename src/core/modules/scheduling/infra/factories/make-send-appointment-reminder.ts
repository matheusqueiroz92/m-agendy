import { SendAppointmentReminderUseCase } from "../../application/use-cases/send-appointment-reminder";
import { WhatsAppAppointmentNotifier } from "../messaging/whatsapp-appointment-notifier";
import { DrizzleAppointmentRepository } from "../persistence/drizzle-appointment-repository";

/**
 * Composition root do caso de uso de envio de lembrete, usado pelo Route
 * Handler que recebe o callback da fila (QStash).
 */
export const makeSendAppointmentReminder = () =>
  new SendAppointmentReminderUseCase(
    new DrizzleAppointmentRepository(),
    new WhatsAppAppointmentNotifier({
      apiUrl: process.env.WHATSAPP_API_URL,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    }),
  );
