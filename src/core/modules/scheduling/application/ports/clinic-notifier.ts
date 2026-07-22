export interface AppointmentConfirmedNotification {
  clinicId: string;
  appointmentId: string;
  patientName: string;
  scheduledAt: Date;
}

export interface DailyLimitWarningNotification {
  clinicId: string;
  /** Limite diário de agendamentos do plano vigente. */
  limit: number;
}

/**
 * Porta de notificação interna da clínica (in-app). Usada para avisar a equipe
 * de eventos do agendamento — ex.: paciente confirmou via WhatsApp, ou a
 * clínica está perto de bater o limite diário de agendamentos do plano.
 */
export interface ClinicNotifier {
  notifyAppointmentConfirmed(
    notification: AppointmentConfirmedNotification,
  ): Promise<void>;
  notifyDailyLimitWarning(
    notification: DailyLimitWarningNotification,
  ): Promise<void>;
}
