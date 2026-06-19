import { SystemClock } from "@/core/shared/infra/system-clock";

import { ScheduleAppointmentUseCase } from "../../application/use-cases/schedule-appointment";
import { WhatsAppAppointmentNotifier } from "../messaging/whatsapp-appointment-notifier";
import { DrizzleAppointmentRepository } from "../persistence/drizzle-appointment-repository";
import { DrizzleClinicPlanProvider } from "../persistence/drizzle-clinic-plan-provider";
import { QStashReminderScheduler } from "../scheduling/qstash-reminder-scheduler";

/**
 * Composition root do caso de uso de agendamento: monta o use case com seus
 * adapters concretos. É o único lugar que conhece as implementações; a camada
 * de delivery (Server Action / Route Handler / API) só chama esta factory.
 *
 * Trocar de banco, de provedor de mensageria ou de fila = trocar aqui, sem
 * tocar no caso de uso nem no domínio.
 */
export const makeScheduleAppointment = () =>
  new ScheduleAppointmentUseCase(
    new DrizzleAppointmentRepository(),
    new WhatsAppAppointmentNotifier({
      apiUrl: process.env.WHATSAPP_API_URL,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    }),
    new QStashReminderScheduler({
      token: process.env.QSTASH_TOKEN,
      destinationUrl: process.env.REMINDER_DISPATCH_URL,
    }),
    new SystemClock(),
    new DrizzleClinicPlanProvider(),
  );
