import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { formatInClinicTimezone } from "@/core/shared/domain/combine-date-and-time";

import {
  AppointmentConfirmedNotification,
  ClinicNotifier,
  DailyLimitWarningNotification,
  WhatsAppIntegrationCompletedNotification,
  WhatsAppSharedNumberDisclosureNotification,
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

  async notifyWhatsAppSharedNumberDisclosure(
    notification: WhatsAppSharedNumberDisclosureNotification,
  ): Promise<void> {
    await db.insert(notificationsTable).values({
      clinicId: notification.clinicId,
      type: "whatsapp.shared_number_disclosure",
      title:
        "As mensagens de WhatsApp para seus pacientes sairão com o nome e número do M.Agendy, não da sua clínica. Para usar o número da sua clínica, solicite a integração em Configurações (planos Premium e Gold).",
    });
  }

  async notifyWhatsAppIntegrationCompleted(
    notification: WhatsAppIntegrationCompletedNotification,
  ): Promise<void> {
    await db.insert(notificationsTable).values({
      clinicId: notification.clinicId,
      type: "whatsapp.integration_completed",
      title:
        "Seu número de WhatsApp já está integrado! As próximas mensagens para os pacientes sairão com o nome e número da sua clínica.",
    });
  }
}
