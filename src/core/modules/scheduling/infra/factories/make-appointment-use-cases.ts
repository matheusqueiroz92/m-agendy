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
import { DrizzleClinicReminderPreference } from "../persistence/drizzle-clinic-reminder-preference";
import { DrizzleClinicNotifier } from "../messaging/drizzle-clinic-notifier";
import { QStashReminderScheduler } from "../scheduling/qstash-reminder-scheduler";
import { makeWhatsAppAppointmentNotifier } from "./make-whatsapp-appointment-notifier";

const makeReminderScheduler = () => {
  // QStash agora tem instâncias regionais (EU/US), cada uma com seu próprio
  // endpoint — https://qstash.upstash.io é só o alias da região EU. Sem
  // QSTASH_URL configurada, o adapter cai no default (EU); defina QSTASH_URL
  // com o endpoint da região escolhida no console da Upstash (ex.:
  // "https://qstash-us-east-1.upstash.io") para publicar na região certa.
  const region = process.env.QSTASH_URL?.replace(/\/+$/, "");

  return new QStashReminderScheduler({
    token: process.env.QSTASH_TOKEN,
    destinationUrl: process.env.REMINDER_DISPATCH_URL,
    qstashUrl: region ? `${region}/v2/publish` : undefined,
  });
};

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
    new DrizzleClinicNotifier(),
    new DrizzleClinicReminderPreference(),
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
