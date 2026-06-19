import { Diagnosis } from "../../domain/diagnosis";

/** Porta de persistência de diagnósticos. */
export interface DiagnosisRepository {
  findById(id: string): Promise<Diagnosis | null>;
  save(diagnosis: Diagnosis): Promise<void>;
  delete(id: string): Promise<void>;
}
