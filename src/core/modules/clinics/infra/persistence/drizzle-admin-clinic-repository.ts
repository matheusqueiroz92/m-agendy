import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentsTable,
  clinicsTable,
  doctorsTable,
  patientsTable,
  usersToClinicsTable,
} from "@/db/schema";

import { ClinicType } from "../../domain/clinic-type";
import { ClinicStatus } from "../../domain/clinic-access";
import {
  AdminClinicListItem,
  AdminClinicRepository,
} from "../../application/ports/admin-clinic-repository";

/** Adapter Drizzle da gestão administrativa de clínicas. */
export class DrizzleAdminClinicRepository implements AdminClinicRepository {
  async listAll(): Promise<AdminClinicListItem[]> {
    const [
      clinics,
      patientCounts,
      doctorCounts,
      appointmentCounts,
      memberCounts,
      owners,
    ] = await Promise.all([
      db.query.clinicsTable.findMany({
        orderBy: (c, { asc }) => [asc(c.name)],
      }),
      db
        .select({ clinicId: patientsTable.clinicId, count: sql<number>`count(*)::int` })
        .from(patientsTable)
        .groupBy(patientsTable.clinicId),
      db
        .select({ clinicId: doctorsTable.clinicId, count: sql<number>`count(*)::int` })
        .from(doctorsTable)
        .groupBy(doctorsTable.clinicId),
      db
        .select({ clinicId: appointmentsTable.clinicId, count: sql<number>`count(*)::int` })
        .from(appointmentsTable)
        .groupBy(appointmentsTable.clinicId),
      db
        .select({ clinicId: usersToClinicsTable.clinicId, count: sql<number>`count(*)::int` })
        .from(usersToClinicsTable)
        .groupBy(usersToClinicsTable.clinicId),
      db.query.usersToClinicsTable.findMany({
        where: eq(usersToClinicsTable.role, "owner"),
        with: { user: true },
      }),
    ]);

    const toMap = (rows: { clinicId: string; count: number }[]) =>
      new Map(rows.map((r) => [r.clinicId, r.count]));
    const patients = toMap(patientCounts);
    const doctors = toMap(doctorCounts);
    const appointments = toMap(appointmentCounts);
    const members = toMap(memberCounts);

    // Primeiro dono encontrado por clínica (fonte do plano "de base").
    const ownerByClinic = new Map<
      string,
      { name: string | null; email: string | null; plan: string | null }
    >();
    for (const o of owners) {
      if (!ownerByClinic.has(o.clinicId) && o.user) {
        ownerByClinic.set(o.clinicId, {
          name: o.user.name ?? null,
          email: o.user.email ?? null,
          plan: o.user.plan ?? null,
        });
      }
    }

    return clinics.map((clinic) => {
      const owner = ownerByClinic.get(clinic.id);
      return {
        id: clinic.id,
        name: clinic.name,
        type: clinic.type as ClinicType,
        status: clinic.status as ClinicStatus,
        blockedReason: clinic.blockedReason ?? null,
        planOverride: clinic.planOverride ?? null,
        planOverrideExpiresAt: clinic.planOverrideExpiresAt ?? null,
        basePlan: owner?.plan ?? null,
        ownerName: owner?.name ?? null,
        ownerEmail: owner?.email ?? null,
        createdAt: clinic.createdAt,
        patientsCount: patients.get(clinic.id) ?? 0,
        doctorsCount: doctors.get(clinic.id) ?? 0,
        appointmentsCount: appointments.get(clinic.id) ?? 0,
        membersCount: members.get(clinic.id) ?? 0,
      };
    });
  }

  async exists(id: string): Promise<boolean> {
    const row = await db.query.clinicsTable.findFirst({
      where: eq(clinicsTable.id, id),
      columns: { id: true },
    });
    return !!row;
  }

  async create(data: { name: string; type: ClinicType }): Promise<{ id: string }> {
    const [row] = await db
      .insert(clinicsTable)
      .values({ name: data.name, type: data.type })
      .returning({ id: clinicsTable.id });
    return { id: row.id };
  }

  async update(id: string, data: { name: string; type: ClinicType }): Promise<void> {
    await db
      .update(clinicsTable)
      .set({ name: data.name, type: data.type, updatedAt: new Date() })
      .where(eq(clinicsTable.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(clinicsTable).where(eq(clinicsTable.id, id));
  }

  async setStatus(
    id: string,
    status: ClinicStatus,
    reason: string | null,
  ): Promise<void> {
    await db
      .update(clinicsTable)
      .set({ status, blockedReason: reason, updatedAt: new Date() })
      .where(eq(clinicsTable.id, id));
  }

  async setPlanOverride(
    id: string,
    planOverride: string | null,
    expiresAt: Date | null,
  ): Promise<void> {
    await db
      .update(clinicsTable)
      .set({
        planOverride,
        planOverrideExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(clinicsTable.id, id));
  }
}
