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

export interface WhatsAppSharedNumberDisclosureNotification {
  clinicId: string;
}

export interface WhatsAppIntegrationCompletedNotification {
  clinicId: string;
  phoneNumberId: string;
}

/**
 * Porta de notificação interna da clínica (in-app). Usada para avisar a equipe
 * de eventos do agendamento — ex.: paciente confirmou via WhatsApp, a clínica
 * está perto de bater o limite diário de agendamentos do plano, ou eventos da
 * integração de WhatsApp próprio (aviso do número compartilhado na criação,
 * conclusão da solicitação de número próprio).
 */
export interface ClinicNotifier {
  notifyAppointmentConfirmed(
    notification: AppointmentConfirmedNotification,
  ): Promise<void>;
  notifyDailyLimitWarning(
    notification: DailyLimitWarningNotification,
  ): Promise<void>;
  /** Disparado uma vez, na criação da clínica: explica que as mensagens saem
   * com o nome/número da plataforma até a clínica integrar o próprio número
   * (Premium/Gold). */
  notifyWhatsAppSharedNumberDisclosure(
    notification: WhatsAppSharedNumberDisclosureNotification,
  ): Promise<void>;
  /** Disparado quando o admin conclui a solicitação de integração,
   * informando a clínica de que o número próprio já está ativo. */
  notifyWhatsAppIntegrationCompleted(
    notification: WhatsAppIntegrationCompletedNotification,
  ): Promise<void>;
}
