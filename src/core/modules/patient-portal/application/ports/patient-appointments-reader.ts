export interface PortalAppointment {
  id: string;
  scheduledAt: Date;
  doctorName: string;
  clinicName: string;
  priceInCents: number;
}

/** Leitura das consultas de um paciente para exibição no portal. */
export interface PatientAppointmentsReader {
  listByPatient(patientId: string): Promise<PortalAppointment[]>;
}
