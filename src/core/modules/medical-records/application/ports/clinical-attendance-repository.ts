import { ClinicalAttendance } from "../../domain/clinical-attendance";

/** Porta de persistência de atendimentos clínicos. */
export interface ClinicalAttendanceRepository {
  findById(id: string): Promise<ClinicalAttendance | null>;
  save(attendance: ClinicalAttendance): Promise<void>;
  delete(id: string): Promise<void>;
}
