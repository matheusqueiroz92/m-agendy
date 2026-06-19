import dayjs from "dayjs";

import { db } from "@/db";
import { notificationsTable } from "@/db/schema";

import {
  AppointmentConfirmedNotification,
  ClinicNotifier,
} from "../../application/ports/clinic-notifier";

/** Adapter que grava notificações in-app da clínica via Drizzle. */
export class DrizzleClinicNotifier implements ClinicNotifier {
  async notifyAppointmentConfirmed(
    notification: AppointmentConfirmedNotification,
  ): Promise<void> {
    const when = dayjs(notification.scheduledAt).format("DD/MM/YYYY [às] HH:mm");

    await db.insert(notificationsTable).values({
      clinicId: notification.clinicId,
      type: "appointment.confirmed",
      title: `${notification.patientName} confirmou a consulta de ${when}.`,
      appointmentId: notification.appointmentId,
    });
  }
}
