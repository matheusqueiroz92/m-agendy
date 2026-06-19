import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { DrizzleAuditLog } from "@/core/shared/infra/drizzle-audit-log";
import { SystemClock } from "@/core/shared/infra/system-clock";

import { DeleteAppointmentUseCase } from "../../application/use-cases/delete-appointment";
import { UpsertAppointmentUseCase } from "../../application/use-cases/upsert-appointment";
import { WhatsAppAppointmentNotifier } from "../messaging/whatsapp-appointment-notifier";
import { DrizzleAppointmentContactDirectory } from "../persistence/drizzle-appointment-contact-directory";
import { DrizzleAppointmentRepository } from "../persistence/drizzle-appointment-repository";
import { QStashReminderScheduler } from "../scheduling/qstash-reminder-scheduler";

const makeReminderScheduler = () =>
  new QStashReminderScheduler({
    token: process.env.QSTASH_TOKEN,
    destinationUrl: process.env.REMINDER_DISPATCH_URL,
  });

const makeNotifier = () =>
  new WhatsAppAppointmentNotifier({
    apiUrl: process.env.WHATSAPP_API_URL,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  });

export const makeUpsertAppointment = () =>
  new UpsertAppointmentUseCase(
    new DrizzleAppointmentRepository(),
    new Authorizer(),
    new DrizzleAuditLog(),
    new SystemClock(),
    makeReminderScheduler(),
    makeNotifier(),
    new DrizzleAppointmentContactDirectory(),
  );

export const makeDeleteAppointment = () =>
  new DeleteAppointmentUseCase(
    new DrizzleAppointmentRepository(),
    new Authorizer(),
    new DrizzleAuditLog(),
    makeReminderScheduler(),
  );
