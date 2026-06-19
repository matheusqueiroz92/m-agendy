export interface BookableProfessional {
  priceInCents: number;
  name: string;
}

export interface FindOrCreatePatientInput {
  clinicId: string;
  name: string;
  email: string;
  phoneNumber: string;
  sex: "male" | "female";
}

/**
 * Porta de apoio ao agendamento online (público). Resolve o profissional
 * (preço + nome, validando que pertence à clínica) e casa/cria o paciente por
 * e-mail ou telefone. Mantém o caso de uso de booking desacoplado do banco.
 */
export interface BookingDirectory {
  getProfessional(params: {
    clinicId: string;
    doctorId: string;
  }): Promise<BookableProfessional | null>;

  findOrCreatePatient(input: FindOrCreatePatientInput): Promise<string>;
}
