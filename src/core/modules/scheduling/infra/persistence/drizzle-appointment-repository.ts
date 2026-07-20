import { and, count, eq, gte, lt, ne } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";

import { Appointment, AppointmentStatus } from "../../domain/appointment";
import {
  AppointmentRepository,
  ConflictQuery,
} from "../../application/ports/appointment-repository";

/**
 * Adapter de persistência que implementa a porta AppointmentRepository via
 * Drizzle. Único lugar deste módulo que conhece o banco.
 */
export class DrizzleAppointmentRepository implements AppointmentRepository {
  async hasConflict(query: ConflictQuery): Promise<boolean> {
    const existing = await db.query.appointmentsTable.findFirst({
      where: and(
        eq(appointmentsTable.clinicId, query.clinicId),
        eq(appointmentsTable.doctorId, query.doctorId),
        eq(appointmentsTable.date, query.scheduledAt),
        query.excludeAppointmentId
          ? ne(appointmentsTable.id, query.excludeAppointmentId)
          : undefined,
      ),
    });

    return Boolean(existing);
  }

  async countByClinicInPeriod(
    clinicId: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, start),
          lt(appointmentsTable.date, end),
        ),
      );
    return row?.value ?? 0;
  }

  async save(appointment: Appointment): Promise<void> {
    const data = appointment.toPrimitives();

    await db
      .insert(appointmentsTable)
      .values({
        id: data.id,
        clinicId: data.clinicId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        date: data.scheduledAt,
        appointmentPriceInCents: data.priceInCents,
        status: data.status,
        type: data.type,
      })
      .onConflictDoUpdate({
        target: [appointmentsTable.id],
        // Não sobrescreve "status" numa edição (preserva confirmações).
        set: {
          clinicId: data.clinicId,
          patientId: data.patientId,
          doctorId: data.doctorId,
          date: data.scheduledAt,
          appointmentPriceInCents: data.priceInCents,
          type: data.type,
          updatedAt: new Date(),
        },
      });
  }

  async findById(id: string): Promise<Appointment | null> {
    const row = await db.query.appointmentsTable.findFirst({
      where: eq(appointmentsTable.id, id),
    });

    if (!row) {
      return null;
    }

    return Appointment.restore({
      id: row.id,
      clinicId: row.clinicId,
      patientId: row.patientId,
      doctorId: row.doctorId,
      scheduledAt: row.date,
      priceInCents: row.appointmentPriceInCents,
      status: row.status,
      type: row.type,
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(appointmentsTable).where(eq(appointmentsTable.id, id));
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
    await db
      .update(appointmentsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(appointmentsTable.id, id));
  }
}
