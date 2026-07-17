import { SystemClock } from "@/core/shared/infra/system-clock";

import { ScheduleAppointmentUseCase } from "../../application/use-cases/schedule-appointment";
import { DrizzleAppointmentRepository } from "../persistence/drizzle-appointment-repository";
import { DrizzleClinicPlanProvider } from "../persistence/drizzle-clinic-plan-provider";
import { QStashReminderScheduler } from "../scheduling/qstash-reminder-scheduler";
import { makeWhatsAppAppointmentNotifier } from "./make-whatsapp-appointment-notifier";

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
    makeWhatsAppAppointmentNotifier(),
    new QStashReminderScheduler({
      token: process.env.QSTASH_TOKEN,
      destinationUrl: process.env.REMINDER_DISPATCH_URL,
    }),
    new SystemClock(),
    new DrizzleClinicPlanProvider(),
  );
