import { eq } from "drizzle-orm";

import { db } from "@/db";
import { prescriptionsTable } from "@/db/schema";

import { Prescription } from "../../domain/prescription";
import { PrescriptionRepository } from "../../application/ports/prescription-repository";

/** Adapter Drizzle de prescrições. */
export class DrizzlePrescriptionRepository implements PrescriptionRepository {
  async findById(id: string): Promise<Prescription | null> {
    const row = await db.query.prescriptionsTable.findFirst({
      where: eq(prescriptionsTable.id, id),
    });

    if (!row) {
      return null;
    }

    return Prescription.restore({
      id: row.id,
      clinicId: row.clinicId,
      patientId: row.patientId,
      doctorId: row.doctorId,
      attendanceId: row.attendanceId,
      medication: row.medication,
      dosage: row.dosage,
      frequency: row.frequency,
      duration: row.duration,
      instructions: row.instructions,
      date: row.date,
    });
  }

  async save(prescription: Prescription): Promise<void> {
    const data = prescription.toPrimitives();

    await db
      .insert(prescriptionsTable)
      .values({
        id: data.id,
        clinicId: data.clinicId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        attendanceId: data.attendanceId,
        medication: data.medication,
        dosage: data.dosage,
        frequency: data.frequency,
        duration: data.duration,
        instructions: data.instructions,
        date: data.date,
      })
      .onConflictDoUpdate({
        target: [prescriptionsTable.id],
        set: {
          doctorId: data.doctorId,
          attendanceId: data.attendanceId,
          medication: data.medication,
          dosage: data.dosage,
          frequency: data.frequency,
          duration: data.duration,
          instructions: data.instructions,
          date: data.date,
          updatedAt: new Date(),
        },
      });
  }

  async delete(id: string): Promise<void> {
    await db.delete(prescriptionsTable).where(eq(prescriptionsTable.id, id));
  }
}
