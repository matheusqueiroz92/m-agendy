export interface ConfirmableAppointment {
  appointmentId: string;
  clinicId: string;
  patientName: string;
  scheduledAt: Date;
}

/**
 * Localiza, a partir do telefone que respondeu no WhatsApp, TODAS as consultas
 * pendentes (futuras) daquele paciente — candidatas a serem confirmadas.
 *
 * Retorna uma lista (não só a mais próxima) de propósito: se o telefone tiver
 * mais de uma consulta pendente, o caso de uso não deve simplesmente confirmar
 * a mais próxima — seria um palpite que pode confirmar a consulta errada.
 */
export interface ConfirmationLookup {
  findConfirmableAppointmentsByPhone(params: {
    phone: string;
    now: Date;
  }): Promise<ConfirmableAppointment[]>;
}
