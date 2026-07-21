import { Patient } from "../../domain/patient";
import {
  PatientRepository,
  PatientSearchResult,
  SearchPatientsByClinicInput,
} from "../ports/patient-repository";

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

  async searchByClinic(
    input: SearchPatientsByClinicInput,
  ): Promise<PatientSearchResult[]> {
    const normalized = input.query.trim().toLowerCase();
    const filtered = this.items
      .filter((patient) => patient.clinicId === input.clinicId)
      .filter((patient) => {
        if (!normalized) return true;
        const p = patient.toPrimitives();
        return (
          p.name.toLowerCase().includes(normalized) ||
          p.email.toLowerCase().includes(normalized) ||
          p.phoneNumber.includes(normalized)
        );
      })
      .sort((a, b) =>
        a.toPrimitives().name.localeCompare(b.toPrimitives().name, "pt-BR"),
      )
      .slice(0, input.limit);

    return filtered.map((patient) => {
      const p = patient.toPrimitives();
      return {
        id: p.id,
        name: p.name,
        email: p.email,
        phoneNumber: p.phoneNumber,
      };
    });
  }
}
