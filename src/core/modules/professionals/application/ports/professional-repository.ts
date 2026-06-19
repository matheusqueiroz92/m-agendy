import { Professional } from "../../domain/professional";

/** Porta de persistência de profissionais (driven port). */
export interface ProfessionalRepository {
  findById(id: string): Promise<Professional | null>;
  /** Total de profissionais da clínica (para limites de plano). */
  countByClinic(clinicId: string): Promise<number>;
  save(professional: Professional): Promise<void>;
  delete(id: string): Promise<void>;
}
