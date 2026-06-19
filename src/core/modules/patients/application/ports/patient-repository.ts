import { Patient } from "../../domain/patient";

/**
 * Porta de persistência de pacientes (driven port). O caso de uso depende desta
 * interface, não do Drizzle.
 */
export interface PatientRepository {
  findById(id: string): Promise<Patient | null>;
  save(patient: Patient): Promise<void>;
  delete(id: string): Promise<void>;
}
