import { Diagnosis } from "../../domain/diagnosis";
import { DiagnosisRepository } from "../ports/diagnosis-repository";

/** Repositório de diagnósticos em memória, para uso em testes. */
export class InMemoryDiagnosisRepository implements DiagnosisRepository {
  public items: Diagnosis[] = [];

  async findById(id: string): Promise<Diagnosis | null> {
    return this.items.find((d) => d.id === id) ?? null;
  }

  async save(diagnosis: Diagnosis): Promise<void> {
    const index = this.items.findIndex((d) => d.id === diagnosis.id);
    if (index >= 0) {
      this.items[index] = diagnosis;
    } else {
      this.items.push(diagnosis);
    }
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((d) => d.id !== id);
  }
}
