import { Prescription } from "../../domain/prescription";
import { PrescriptionRepository } from "../ports/prescription-repository";

/** Repositório de prescrições em memória, para uso em testes. */
export class InMemoryPrescriptionRepository implements PrescriptionRepository {
  public items: Prescription[] = [];

  async findById(id: string): Promise<Prescription | null> {
    return this.items.find((p) => p.id === id) ?? null;
  }

  async save(prescription: Prescription): Promise<void> {
    const index = this.items.findIndex((p) => p.id === prescription.id);
    if (index >= 0) {
      this.items[index] = prescription;
    } else {
      this.items.push(prescription);
    }
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((p) => p.id !== id);
  }
}
