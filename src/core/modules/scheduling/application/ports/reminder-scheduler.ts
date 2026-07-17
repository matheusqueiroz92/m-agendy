export interface AppointmentReminder {
  appointmentId: string;
  /** Clínica dona do agendamento (resolve o número de WhatsApp de envio). */
  clinicId: string;
  /** Quando o lembrete deve ser disparado. */
  runAt: Date;
  /** Dados denormalizados no payload para o worker não precisar reconsultar. */
  to: string; // telefone do paciente
  patientName: string;
  doctorName?: string;
  /** Horário da consulta (conteúdo da mensagem). */
  scheduledAt: Date;
}

/**
 * Porta de agendamento de lembretes (driven port).
 *
 * Abstrai "executar um trabalho no futuro". O caso de uso não sabe se por trás
 * há QStash, Inngest, Trigger.dev ou BullMQ+Redis — só conhece esta interface.
 * Resolve a principal limitação do Next.js serverless: trabalho agendado/
 * assíncrono que não cabe no ciclo de uma requisição.
 */
export interface ReminderScheduler {
  /** Agenda o envio de um lembrete para `reminder.runAt`. */
  schedule(reminder: AppointmentReminder): Promise<void>;
  /** Cancela lembretes pendentes (ex.: consulta remarcada ou cancelada). */
  cancelForAppointment(appointmentId: string): Promise<void>;
}
