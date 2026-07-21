import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { formatInClinicTimezone } from "@/core/shared/domain/combine-date-and-time";

import {
  AppointmentConfirmedNotification,
  ClinicNotifier,
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
}
