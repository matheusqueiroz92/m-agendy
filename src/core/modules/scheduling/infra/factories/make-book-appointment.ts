import { DrizzleAuditLog } from "@/core/shared/infra/drizzle-audit-log";
import { SystemClock } from "@/core/shared/infra/system-clock";

import { BookAppointmentUseCase } from "../../application/use-cases/book-appointment";
import { WhatsAppAppointmentNotifier } from "../messaging/whatsapp-appointment-notifier";
import { DrizzleBookingDirectory } from "../persistence/drizzle-booking-directory";
import { DrizzleAppointmentRepository } from "../persistence/drizzle-appointment-repository";
import { DrizzleClinicPlanProvider } from "../persistence/drizzle-clinic-plan-provider";
import { QStashReminderScheduler } from "../scheduling/qstash-reminder-scheduler";

/** Composition root do agendamento online (link público). */
export const makeBookAppointment = () =>
  new BookAppointmentUseCase(
    new DrizzleAppointmentRepository(),
    new DrizzleBookingDirectory(),
    new QStashReminderScheduler({
      token: process.env.QSTASH_TOKEN,
      destinationUrl: process.env.REMINDER_DISPATCH_URL,
    }),
    new WhatsAppAppointmentNotifier({
      apiUrl: process.env.WHATSAPP_API_URL,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    }),
    new DrizzleAuditLog(),
    new SystemClock(),
    new DrizzleClinicPlanProvider(),
  );
