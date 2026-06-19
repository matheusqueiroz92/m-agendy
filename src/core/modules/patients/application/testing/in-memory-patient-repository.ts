import { Patient } from "../../domain/patient";
import { PatientRepository } from "../ports/patient-repository";

/** Repositório de pacientes em memória, para uso em testes. */
export class InMemoryPatientRepository implements PatientRepository {
  public items: Patient[] = [];

  async findById(id: string): Promise<Patient | null> {
    return this.items.find((patient) => patient.id === id) ?? null;
  }

  async save(patient: Patient): Promise<void> {
    const index = this.items.findIndex((item) => item.id === patient.id);
    if (index >= 0) {
      this.items[index] = patient;
    } else {
      this.items.push(patient);
    }
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((patient) => patient.id !== id);
  }
}
