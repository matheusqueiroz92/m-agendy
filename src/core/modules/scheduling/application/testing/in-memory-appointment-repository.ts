import { Appointment, AppointmentStatus } from "../../domain/appointment";
import {
  addMinutes,
  intervalsOverlap,
} from "../../domain/availability";
import {
  AppointmentRepository,
  ConflictQuery,
} from "../ports/appointment-repository";

/** Implementação em memória da porta de repositório, para uso em testes. */
export class InMemoryAppointmentRepository implements AppointmentRepository {
  public items: Appointment[] = [];
  /**
   * `createdAt` não existe na entidade de domínio (é um detalhe de
   * persistência, timestamp automático da coluna no banco) — guardado à
   * parte aqui só para o fake conseguir simular `countCreatedByClinicInPeriod`
   * nos testes. `save(appointment, createdAt)` aceita o segundo argumento
   * opcional para os testes controlarem isso deterministicamente.
   */
  private createdAtById = new Map<string, Date>();

  async hasConflict(query: ConflictQuery): Promise<boolean> {
    const queryEnd = addMinutes(query.scheduledAt, query.durationInMinutes);

    return this.items.some((appointment) => {
      const data = appointment.toPrimitives();
      if (
        data.clinicId !== query.clinicId ||
        data.doctorId !== query.doctorId ||
        data.id === query.excludeAppointmentId ||
        data.status === "cancelled" ||
        data.status === "no_show"
      ) {
        return false;
      }

      return intervalsOverlap(
        query.scheduledAt,
        queryEnd,
        data.scheduledAt,
        addMinutes(data.scheduledAt, data.durationInMinutes),
      );
    });
  }

  async countByClinicInPeriod(
    clinicId: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    return this.items.filter((a) => {
      const when = a.scheduledAt.getTime();
      return (
        a.clinicId === clinicId &&
        when >= start.getTime() &&
        when < end.getTime()
      );
    }).length;
  }

  async save(appointment: Appointment, createdAt?: Date): Promise<void> {
    const index = this.items.findIndex((item) => item.id === appointment.id);
    if (index >= 0) {
      this.items[index] = appointment;
    } else {
      this.items.push(appointment);
      this.createdAtById.set(appointment.id, createdAt ?? new Date());
    }
  }

  async countCreatedByClinicInPeriod(
    clinicId: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    return this.items.filter((a) => {
      const createdAt = this.createdAtById.get(a.id) ?? new Date(0);
      return (
        a.clinicId === clinicId &&
        createdAt.getTime() >= start.getTime() &&
        createdAt.getTime() < end.getTime()
      );
    }).length;
  }

  async findById(id: string): Promise<Appointment | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.items[index] = this.items[index].withStatus(status);
    }
  }
}
