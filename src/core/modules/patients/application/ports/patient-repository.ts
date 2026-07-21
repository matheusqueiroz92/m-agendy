import { Patient } from "../../domain/patient";

export type PatientSearchResult = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
};

export type SearchPatientsByClinicInput = {
  clinicId: string;
  query: string;
  limit: number;
};

/**
 * Porta de persistência de pacientes (driven port). O caso de uso depende desta
 * interface, não do Drizzle.
 */
export interface PatientRepository {
  findById(id: string): Promise<Patient | null>;
  save(patient: Patient): Promise<void>;
  delete(id: string): Promise<void>;
  searchByClinic(
    input: SearchPatientsByClinicInput,
  ): Promise<PatientSearchResult[]>;
}
