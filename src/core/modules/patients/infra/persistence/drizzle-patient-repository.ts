import { and, asc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";

import {
  PatientRepository,
  PatientSearchResult,
  SearchPatientsByClinicInput,
} from "../../application/ports/patient-repository";
import { Patient } from "../../domain/patient";

/** Adapter Drizzle da porta PatientRepository. */
export class DrizzlePatientRepository implements PatientRepository {
  async findById(id: string): Promise<Patient | null> {
    const row = await db.query.patientsTable.findFirst({
      where: eq(patientsTable.id, id),
    });

    if (!row) {
      return null;
    }

    return Patient.restore({
      id: row.id,
      clinicId: row.clinicId,
      name: row.name,
      email: row.email,
      phoneNumber: row.phoneNumber,
      sex: row.sex,
    });
  }

  async save(patient: Patient): Promise<void> {
    const data = patient.toPrimitives();

    await db
      .insert(patientsTable)
      .values({
        id: data.id,
        clinicId: data.clinicId,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        sex: data.sex,
      })
      .onConflictDoUpdate({
        target: [patientsTable.id],
        set: {
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          sex: data.sex,
          updatedAt: new Date(),
        },
      });
  }

  async delete(id: string): Promise<void> {
    await db.delete(patientsTable).where(eq(patientsTable.id, id));
  }

  async searchByClinic(
    input: SearchPatientsByClinicInput,
  ): Promise<PatientSearchResult[]> {
    const normalized = input.query.trim();
    const filters = [eq(patientsTable.clinicId, input.clinicId)];

    if (normalized) {
      const pattern = `%${normalized}%`;
      filters.push(
        or(
          ilike(patientsTable.name, pattern),
          ilike(patientsTable.email, pattern),
          ilike(patientsTable.phoneNumber, pattern),
        )!,
      );
    }

    const rows = await db
      .select({
        id: patientsTable.id,
        name: patientsTable.name,
        email: patientsTable.email,
        phoneNumber: patientsTable.phoneNumber,
      })
      .from(patientsTable)
      .where(and(...filters))
      .orderBy(asc(patientsTable.name))
      .limit(input.limit);

    return rows;
  }
}
