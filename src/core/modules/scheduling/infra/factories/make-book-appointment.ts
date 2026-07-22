import { DrizzleAuditLog } from "@/core/shared/infra/drizzle-audit-log";
import { SystemClock } from "@/core/shared/infra/system-clock";

import { BookAppointmentUseCase } from "../../application/use-cases/book-appointment";
import { DrizzleBookingDirectory } from "../persistence/drizzle-booking-directory";
import { DrizzleAppointmentRepository } from "../persistence/drizzle-appointment-repository";
import { DrizzleClinicPlanProvider } from "../persistence/drizzle-clinic-plan-provider";
import { DrizzleClinicReminderPreference } from "../persistence/drizzle-clinic-reminder-preference";
import { DrizzleClinicNotifier } from "../messaging/drizzle-clinic-notifier";
import { QStashReminderScheduler } from "../scheduling/qstash-reminder-scheduler";
import { makeWhatsAppAppointmentNotifier } from "./make-whatsapp-appointment-notifier";

/** Composition root do agendamento online (link público). */
export const makeBookAppointment = () =>
  new BookAppointmentUseCase(
    new DrizzleAppointmentRepository(),
    new DrizzleBookingDirectory(),
    new QStashReminderScheduler({
      token: process.env.QSTASH_TOKEN,
      destinationUrl: process.env.REMINDER_DISPATCH_URL,
    }),
    makeWhatsAppAppointmentNotifier(),
    new DrizzleAuditLog(),
    new SystemClock(),
    new DrizzleClinicPlanProvider(),
    new DrizzleClinicNotifier(),
    new DrizzleClinicReminderPreference(),
  );
