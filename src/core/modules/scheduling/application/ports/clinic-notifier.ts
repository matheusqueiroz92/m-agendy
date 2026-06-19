export interface AppointmentConfirmedNotification {
  clinicId: string;
  appointmentId: string;
  patientName: string;
  scheduledAt: Date;
}

/**
 * Porta de notificação interna da clínica (in-app). Usada para avisar a equipe
 * de eventos do agendamento — ex.: paciente confirmou via WhatsApp.
 */
export interface ClinicNotifier {
  notifyAppointmentConfirmed(
    notification: AppointmentConfirmedNotification,
  ): Promise<void>;
}
