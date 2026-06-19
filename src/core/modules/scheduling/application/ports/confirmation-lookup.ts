export interface ConfirmableAppointment {
  appointmentId: string;
  clinicId: string;
  patientName: string;
  scheduledAt: Date;
}

/**
 * Localiza, a partir do telefone que respondeu no WhatsApp, a próxima consulta
 * pendente (futura) daquele paciente — candidata a ser confirmada.
 */
export interface ConfirmationLookup {
  findConfirmableByPhone(params: {
    phone: string;
    now: Date;
  }): Promise<ConfirmableAppointment | null>;
}
