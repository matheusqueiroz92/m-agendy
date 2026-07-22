import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { formatInClinicTimezone } from "@/core/shared/domain/combine-date-and-time";

import {
  AppointmentConfirmedNotification,
  ClinicNotifier,
  DailyLimitWarningNotification,
} from "../../application/ports/clinic-notifier";

/** Adapter que grava notificações in-app da clínica via Drizzle. */
export class DrizzleClinicNotifier implements ClinicNotifier {
  async notifyAppointmentConfirmed(
    notification: AppointmentConfirmedNotification,
  ): Promise<void> {
    const when = formatInClinicTimezone(
      notification.scheduledAt,
      "DD/MM/YYYY [às] HH:mm",
    );

    await db.insert(notificationsTable).values({
      clinicId: notification.clinicId,
      type: "appointment.confirmed",
      title: `${notification.patientName} confirmou a consulta de ${when}.`,
      appointmentId: notification.appointmentId,
    });
  }

  async notifyDailyLimitWarning(
    notification: DailyLimitWarningNotification,
  ): Promise<void> {
    await db.insert(notificationsTable).values({
      clinicId: notification.clinicId,
      type: "plan.daily_limit_warning",
      title: `Falta apenas 1 agendamento para atingir o limite diário do seu plano (${notification.limit}/dia). Considere fazer upgrade para não ficar sem agendar hoje.`,
    });
  }
}
