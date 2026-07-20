import { Appointment, AppointmentStatus } from "../../domain/appointment";

export interface ConflictQuery {
  clinicId: string;
  doctorId: string;
  scheduledAt: Date;
  durationInMinutes: number;
  /** Ao editar, ignora o próprio agendamento na verificação de conflito. */
  excludeAppointmentId?: string;
}

/**
 * Porta de persistência de agendamentos (driven port).
 */
export interface AppointmentRepository {
  hasConflict(query: ConflictQuery): Promise<boolean>;
  /** Total de agendamentos da clínica no período [start, end) (limites de plano). */
  countByClinicInPeriod(
    clinicId: string,
    start: Date,
    end: Date,
  ): Promise<number>;
  save(appointment: Appointment): Promise<void>;
  findById(id: string): Promise<Appointment | null>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: AppointmentStatus): Promise<void>;
}
