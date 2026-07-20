import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { DrizzleAuditLog } from "@/core/shared/infra/drizzle-audit-log";
import { SystemClock } from "@/core/shared/infra/system-clock";

import { CancelAppointmentUseCase } from "../../application/use-cases/cancel-appointment";
import { MarkAppointmentNoShowUseCase } from "../../application/use-cases/mark-appointment-no-show";
import { RescheduleAppointmentUseCase } from "../../application/use-cases/reschedule-appointment";
import { UpsertAppointmentUseCase } from "../../application/use-cases/upsert-appointment";
import { DrizzleAppointmentContactDirectory } from "../persistence/drizzle-appointment-contact-directory";
import { DrizzleAppointmentRepository } from "../persistence/drizzle-appointment-repository";
import { DrizzleAvailabilityReader } from "../persistence/drizzle-availability-reader";
import { QStashReminderScheduler } from "../scheduling/qstash-reminder-scheduler";
import { makeWhatsAppAppointmentNotifier } from "./make-whatsapp-appointment-notifier";

const makeReminderScheduler = () =>
  new QStashReminderScheduler({
    token: process.env.QSTASH_TOKEN,
    destinationUrl: process.env.REMINDER_DISPATCH_URL,
  });

export const makeUpsertAppointment = () =>
  new UpsertAppointmentUseCase(
    new DrizzleAppointmentRepository(),
    new Authorizer(),
    new DrizzleAuditLog(),
    new SystemClock(),
    makeReminderScheduler(),
    makeWhatsAppAppointmentNotifier(),
    new DrizzleAppointmentContactDirectory(),
    new DrizzleAvailabilityReader(),
  );

export const makeRescheduleAppointment = () =>
  new RescheduleAppointmentUseCase(
    new DrizzleAppointmentRepository(),
    new Authorizer(),
    new DrizzleAuditLog(),
    new SystemClock(),
    makeReminderScheduler(),
    makeWhatsAppAppointmentNotifier(),
    new DrizzleAppointmentContactDirectory(),
    new DrizzleAvailabilityReader(),
  );

export const makeCancelAppointment = () =>
  new CancelAppointmentUseCase(
    new DrizzleAppointmentRepository(),
    new Authorizer(),
    new DrizzleAuditLog(),
    makeReminderScheduler(),
    makeWhatsAppAppointmentNotifier(),
    new DrizzleAppointmentContactDirectory(),
  );

export const makeMarkAppointmentNoShow = () =>
  new MarkAppointmentNoShowUseCase(
    new DrizzleAppointmentRepository(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );
