import { sql } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentsTable,
  clinicsTable,
  doctorsTable,
  patientsTable,
  usersToClinicsTable,
} from "@/db/schema";

import {
  ClinicDirectory,
  ClinicSummary,
} from "../../application/ports/clinic-directory";

/** Adapter Drizzle do ClinicDirectory: lista clínicas com contagens. */
export class DrizzleClinicDirectory implements ClinicDirectory {
  async listAllWithStats(): Promise<ClinicSummary[]> {
    const [clinics, patientCounts, doctorCounts, appointmentCounts, memberCounts] =
      await Promise.all([
        db.query.clinicsTable.findMany({
          orderBy: (clinics, { asc }) => [asc(clinics.name)],
        }),
        db
          .select({
            clinicId: patientsTable.clinicId,
            count: sql<number>`count(*)::int`,
          })
          .from(patientsTable)
          .groupBy(patientsTable.clinicId),
        db
          .select({
            clinicId: doctorsTable.clinicId,
            count: sql<number>`count(*)::int`,
          })
          .from(doctorsTable)
          .groupBy(doctorsTable.clinicId),
        db
          .select({
            clinicId: appointmentsTable.clinicId,
            count: sql<number>`count(*)::int`,
          })
          .from(appointmentsTable)
          .groupBy(appointmentsTable.clinicId),
        db
          .select({
            clinicId: usersToClinicsTable.clinicId,
            count: sql<number>`count(*)::int`,
          })
          .from(usersToClinicsTable)
          .groupBy(usersToClinicsTable.clinicId),
      ]);

    const toMap = (rows: { clinicId: string; count: number }[]) =>
      new Map(rows.map((row) => [row.clinicId, row.count]));

    const patients = toMap(patientCounts);
    const doctors = toMap(doctorCounts);
    const appointments = toMap(appointmentCounts);
    const members = toMap(memberCounts);

    return clinics.map((clinic) => ({
      id: clinic.id,
      name: clinic.name,
      createdAt: clinic.createdAt,
      patientsCount: patients.get(clinic.id) ?? 0,
      doctorsCount: doctors.get(clinic.id) ?? 0,
      appointmentsCount: appointments.get(clinic.id) ?? 0,
      membersCount: members.get(clinic.id) ?? 0,
    }));
  }
}
