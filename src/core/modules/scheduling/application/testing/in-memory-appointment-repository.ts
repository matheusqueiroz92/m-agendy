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

  async save(appointment: Appointment): Promise<void> {
    const index = this.items.findIndex((item) => item.id === appointment.id);
    if (index >= 0) {
      this.items[index] = appointment;
    } else {
      this.items.push(appointment);
    }
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
