export interface AppointmentContact {
  patientName: string;
  patientPhoneNumber: string | null;
  doctorName: string | null;
}

/**
 * Porta de leitura dos dados de contato necessários para confirmar e lembrar
 * um agendamento (nome/telefone do paciente e nome do profissional). Mantém o
 * caso de uso desacoplado de como esses dados são obtidos.
 */
export interface AppointmentContactDirectory {
  getContact(params: {
    clinicId: string;
    patientId: string;
    doctorId: string;
  }): Promise<AppointmentContact | null>;
}
