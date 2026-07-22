/**
 * Consulta se a clínica tem os lembretes automáticos de agendamento
 * habilitados (toggle "Lembretes de Agendamento" em Configurações →
 * Notificações). Desabilitado, o agendamento ainda é confirmado por
 * WhatsApp normalmente, mas os lembretes de 24h/2h antes não são
 * enfileirados.
 */
export interface ClinicReminderPreference {
  areRemindersEnabled(clinicId: string): Promise<boolean>;
}
