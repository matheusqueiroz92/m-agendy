import { MedicalRecord } from "../../domain/medical-record";

/** Porta de persistência do prontuário base (upsert por paciente). */
export interface MedicalRecordRepository {
  findByPatient(patientId: string): Promise<MedicalRecord | null>;
  save(record: MedicalRecord): Promise<void>;
}
