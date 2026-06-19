import { Prescription } from "../../domain/prescription";

/** Porta de persistência de prescrições. */
export interface PrescriptionRepository {
  findById(id: string): Promise<Prescription | null>;
  save(prescription: Prescription): Promise<void>;
  delete(id: string): Promise<void>;
}
