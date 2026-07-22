import { and, eq, gte, lt, ne, notInArray, count } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";

import { Appointment, AppointmentStatus } from "../../domain/appointment";
import {
  addMinutes,
  intervalsOverlap,
} from "../../domain/availability";
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
    const dayStart = new Date(query.scheduledAt);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const queryEnd = addMinutes(query.scheduledAt, query.durationInMinutes);

    const candidates = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.clinicId, query.clinicId),
        eq(appointmentsTable.doctorId, query.doctorId),
        gte(appointmentsTable.date, dayStart),
        lt(appointmentsTable.date, dayEnd),
        notInArray(appointmentsTable.status, ["cancelled", "no_show"]),
        query.excludeAppointmentId
          ? ne(appointmentsTable.id, query.excludeAppointmentId)
          : undefined,
      ),
    });

    return candidates.some((row) =>
      intervalsOverlap(
        query.scheduledAt,
        queryEnd,
        row.date,
        addMinutes(row.date, row.durationInMinutes),
      ),
    );
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

  async countCreatedByClinicInPeriod(
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
          gte(appointmentsTable.createdAt, start),
          lt(appointmentsTable.createdAt, end),
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
        durationInMinutes: data.durationInMinutes,
        appointmentPriceInCents: data.priceInCents,
        status: data.status,
        type: data.type,
      })
      .onConflictDoUpdate({
        target: [appointmentsTable.id],
        set: {
          clinicId: data.clinicId,
          patientId: data.patientId,
          doctorId: data.doctorId,
          date: data.scheduledAt,
          durationInMinutes: data.durationInMinutes,
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
      durationInMinutes: row.durationInMinutes,
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
