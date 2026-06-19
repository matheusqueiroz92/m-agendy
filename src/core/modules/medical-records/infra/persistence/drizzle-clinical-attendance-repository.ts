import { eq } from "drizzle-orm";

import { db } from "@/db";
import { clinicalAttendancesTable } from "@/db/schema";

import { ClinicalAttendance } from "../../domain/clinical-attendance";
import { ClinicalAttendanceRepository } from "../../application/ports/clinical-attendance-repository";

/** Adapter Drizzle de atendimentos clínicos. */
export class DrizzleClinicalAttendanceRepository
  implements ClinicalAttendanceRepository
{
  async findById(id: string): Promise<ClinicalAttendance | null> {
    const row = await db.query.clinicalAttendancesTable.findFirst({
      where: eq(clinicalAttendancesTable.id, id),
    });

    if (!row) {
      return null;
    }

    return ClinicalAttendance.restore({
      id: row.id,
      clinicId: row.clinicId,
      patientId: row.patientId,
      doctorId: row.doctorId,
      appointmentId: row.appointmentId,
      date: row.date,
      chiefComplaint: row.chiefComplaint,
      historyOfPresentIllness: row.historyOfPresentIllness,
      physicalExam: row.physicalExam,
      conduct: row.conduct,
      notes: row.notes,
    });
  }

  async save(attendance: ClinicalAttendance): Promise<void> {
    const data = attendance.toPrimitives();

    await db
      .insert(clinicalAttendancesTable)
      .values({
        id: data.id,
        clinicId: data.clinicId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentId: data.appointmentId,
        date: data.date,
        chiefComplaint: data.chiefComplaint,
        historyOfPresentIllness: data.historyOfPresentIllness,
        physicalExam: data.physicalExam,
        conduct: data.conduct,
        notes: data.notes,
      })
      .onConflictDoUpdate({
        target: [clinicalAttendancesTable.id],
        set: {
          doctorId: data.doctorId,
          appointmentId: data.appointmentId,
          date: data.date,
          chiefComplaint: data.chiefComplaint,
          historyOfPresentIllness: data.historyOfPresentIllness,
          physicalExam: data.physicalExam,
          conduct: data.conduct,
          notes: data.notes,
          updatedAt: new Date(),
        },
      });
  }

  async delete(id: string): Promise<void> {
    await db
      .delete(clinicalAttendancesTable)
      .where(eq(clinicalAttendancesTable.id, id));
  }
}
