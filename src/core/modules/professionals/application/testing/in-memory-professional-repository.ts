import { Professional } from "../../domain/professional";
import { ProfessionalRepository } from "../ports/professional-repository";

/** Repositório de profissionais em memória, para uso em testes. */
export class InMemoryProfessionalRepository implements ProfessionalRepository {
  public items: Professional[] = [];

  async findById(id: string): Promise<Professional | null> {
    return this.items.find((professional) => professional.id === id) ?? null;
  }

  async countByClinic(clinicId: string): Promise<number> {
    return this.items.filter((p) => p.clinicId === clinicId).length;
  }

  async save(professional: Professional): Promise<void> {
    const index = this.items.findIndex((item) => item.id === professional.id);
    if (index >= 0) {
      this.items[index] = professional;
    } else {
      this.items.push(professional);
    }
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((professional) => professional.id !== id);
  }
}
