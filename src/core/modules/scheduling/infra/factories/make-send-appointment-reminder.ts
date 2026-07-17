import { SendAppointmentReminderUseCase } from "../../application/use-cases/send-appointment-reminder";
import { DrizzleAppointmentRepository } from "../persistence/drizzle-appointment-repository";
import { makeWhatsAppAppointmentNotifier } from "./make-whatsapp-appointment-notifier";

/**
 * Composition root do caso de uso de envio de lembrete, usado pelo Route
 * Handler que recebe o callback da fila (QStash).
 */
export const makeSendAppointmentReminder = () =>
  new SendAppointmentReminderUseCase(
    new DrizzleAppointmentRepository(),
    makeWhatsAppAppointmentNotifier(),
  );
