import { MedicalRecord } from "../../domain/medical-record";
import { MedicalRecordRepository } from "../ports/medical-record-repository";
import { PatientAccessChecker } from "../ports/patient-access";

/** Repositório de prontuário em memória (upsert por paciente). */
export class InMemoryMedicalRecordRepository
  implements MedicalRecordRepository
{
  public items: MedicalRecord[] = [];

  async findByPatient(patientId: string): Promise<MedicalRecord | null> {
    return this.items.find((r) => r.patientId === patientId) ?? null;
  }

  async save(record: MedicalRecord): Promise<void> {
    const index = this.items.findIndex(
      (r) => r.patientId === record.patientId,
    );
    if (index >= 0) {
      this.items[index] = record;
    } else {
      this.items.push(record);
    }
  }
}

/** Verificador de acesso fake: lista de pares "patientId:clinicId" válidos. */
export class FakePatientAccessChecker implements PatientAccessChecker {
  constructor(private readonly allowed: Set<string> = new Set()) {}

  allow(patientId: string, clinicId: string) {
    this.allowed.add(`${patientId}:${clinicId}`);
  }

  async belongsToClinic(params: {
    patientId: string;
    clinicId: string;
  }): Promise<boolean> {
    return this.allowed.has(`${params.patientId}:${params.clinicId}`);
  }
}
