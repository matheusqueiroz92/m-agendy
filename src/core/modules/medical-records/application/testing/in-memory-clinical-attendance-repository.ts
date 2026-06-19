import { ClinicalAttendance } from "../../domain/clinical-attendance";
import { ClinicalAttendanceRepository } from "../ports/clinical-attendance-repository";

/** Repositório de atendimentos em memória, para uso em testes. */
export class InMemoryClinicalAttendanceRepository
  implements ClinicalAttendanceRepository
{
  public items: ClinicalAttendance[] = [];

  async findById(id: string): Promise<ClinicalAttendance | null> {
    return this.items.find((a) => a.id === id) ?? null;
  }

  async save(attendance: ClinicalAttendance): Promise<void> {
    const index = this.items.findIndex((a) => a.id === attendance.id);
    if (index >= 0) {
      this.items[index] = attendance;
    } else {
      this.items.push(attendance);
    }
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((a) => a.id !== id);
  }
}
