export interface AppointmentScheduledNotification {
  to: string; // telefone do paciente (E.164 / formato do provedor)
  patientName: string;
  scheduledAt: Date;
  doctorName?: string;
}

/** Mesma forma da notificação de agendamento, usada para o lembrete. */
export type AppointmentReminderNotification = AppointmentScheduledNotification;

/** Mesma forma da notificação de agendamento, usada para o cancelamento. */
export type AppointmentCancelledNotification = AppointmentScheduledNotification;

/**
 * Porta de notificação de agendamentos (driven port).
 *
 * Propositalmente agnóstica ao canal: hoje é implementada por um adapter de
 * WhatsApp, mas amanhã poderia ser SMS ou e-mail sem mudar o caso de uso.
 * É aqui que entra a futura integração com a API do WhatsApp.
 */
export interface AppointmentNotifier {
  /** Confirmação imediata, no momento do agendamento. */
  notifyScheduled(notification: AppointmentScheduledNotification): Promise<void>;
  /** Lembrete enviado próximo da data (disparado pelo agendador). */
  notifyReminder(notification: AppointmentReminderNotification): Promise<void>;
  /** Aviso de cancelamento, enviado quando a clínica cancela o agendamento. */
  notifyCancelled(notification: AppointmentCancelledNotification): Promise<void>;
}
