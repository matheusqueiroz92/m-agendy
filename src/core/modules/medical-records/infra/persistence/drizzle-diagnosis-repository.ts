import { eq } from "drizzle-orm";

import { db } from "@/db";
import { diagnosesTable } from "@/db/schema";

import { Diagnosis } from "../../domain/diagnosis";
import { DiagnosisRepository } from "../../application/ports/diagnosis-repository";

/** Adapter Drizzle de diagnósticos. */
export class DrizzleDiagnosisRepository implements DiagnosisRepository {
  async findById(id: string): Promise<Diagnosis | null> {
    const row = await db.query.diagnosesTable.findFirst({
      where: eq(diagnosesTable.id, id),
    });

    if (!row) {
      return null;
    }

    return Diagnosis.restore({
      id: row.id,
      clinicId: row.clinicId,
      patientId: row.patientId,
      attendanceId: row.attendanceId,
      description: row.description,
      cid10Code: row.cid10Code,
      status: row.status,
      date: row.date,
      notes: row.notes,
    });
  }

  async save(diagnosis: Diagnosis): Promise<void> {
    const data = diagnosis.toPrimitives();

    await db
      .insert(diagnosesTable)
      .values({
        id: data.id,
        clinicId: data.clinicId,
        patientId: data.patientId,
        attendanceId: data.attendanceId,
        description: data.description,
        cid10Code: data.cid10Code,
        status: data.status,
        date: data.date,
        notes: data.notes,
      })
      .onConflictDoUpdate({
        target: [diagnosesTable.id],
        set: {
          attendanceId: data.attendanceId,
          description: data.description,
          cid10Code: data.cid10Code,
          status: data.status,
          date: data.date,
          notes: data.notes,
          updatedAt: new Date(),
        },
      });
  }

  async delete(id: string): Promise<void> {
    await db.delete(diagnosesTable).where(eq(diagnosesTable.id, id));
  }
}
