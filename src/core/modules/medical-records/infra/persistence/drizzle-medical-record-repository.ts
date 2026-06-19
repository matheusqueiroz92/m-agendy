import { eq } from "drizzle-orm";

import { db } from "@/db";
import { medicalRecordsTable } from "@/db/schema";

import { MedicalRecord } from "../../domain/medical-record";
import { MedicalRecordRepository } from "../../application/ports/medical-record-repository";

/** Adapter Drizzle do prontuário base (upsert por paciente). */
export class DrizzleMedicalRecordRepository
  implements MedicalRecordRepository
{
  async findByPatient(patientId: string): Promise<MedicalRecord | null> {
    const row = await db.query.medicalRecordsTable.findFirst({
      where: eq(medicalRecordsTable.patientId, patientId),
    });

    if (!row) {
      return null;
    }

    return MedicalRecord.restore({
      patientId: row.patientId,
      clinicId: row.clinicId,
      bloodType: row.bloodType,
      allergies: row.allergies,
      medicationsInUse: row.medicationsInUse,
      clinicalHistory: row.clinicalHistory,
      surgicalHistory: row.surgicalHistory,
      familyHistory: row.familyHistory,
      habits: row.habits,
      notes: row.notes,
    });
  }

  async save(record: MedicalRecord): Promise<void> {
    const data = record.toPrimitives();

    await db
      .insert(medicalRecordsTable)
      .values({
        clinicId: data.clinicId,
        patientId: data.patientId,
        bloodType: data.bloodType,
        allergies: data.allergies,
        medicationsInUse: data.medicationsInUse,
        clinicalHistory: data.clinicalHistory,
        surgicalHistory: data.surgicalHistory,
        familyHistory: data.familyHistory,
        habits: data.habits,
        notes: data.notes,
      })
      .onConflictDoUpdate({
        target: [medicalRecordsTable.patientId],
        set: {
          bloodType: data.bloodType,
          allergies: data.allergies,
          medicationsInUse: data.medicationsInUse,
          clinicalHistory: data.clinicalHistory,
          surgicalHistory: data.surgicalHistory,
          familyHistory: data.familyHistory,
          habits: data.habits,
          notes: data.notes,
          updatedAt: new Date(),
        },
      });
  }
}
