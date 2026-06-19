import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";

import {
  PortalPatient,
  PortalPatientDirectory,
} from "../../application/ports/portal-patient-directory";

const toPortalPatient = (row: {
  id: string;
  name: string;
  clinicId: string;
}): PortalPatient => ({
  id: row.id,
  name: row.name,
  clinicId: row.clinicId,
});

/** Adapter Drizzle do diretório de pacientes do portal (com auto-vínculo). */
export class DrizzlePortalPatientDirectory implements PortalPatientDirectory {
  async findByUserId(userId: string): Promise<PortalPatient | null> {
    const row = await db.query.patientsTable.findFirst({
      where: eq(patientsTable.userId, userId),
    });
    return row ? toPortalPatient(row) : null;
  }

  async linkByEmail(params: {
    userId: string;
    email: string;
  }): Promise<PortalPatient | null> {
    const email = params.email.trim().toLowerCase();

    // Só vincula um paciente que ainda não tem conta associada.
    const candidate = await db.query.patientsTable.findFirst({
      where: and(
        eq(patientsTable.email, email),
        isNull(patientsTable.userId),
      ),
    });

    if (!candidate) {
      return null;
    }

    await db
      .update(patientsTable)
      .set({ userId: params.userId, updatedAt: new Date() })
      .where(eq(patientsTable.id, candidate.id));

    return toPortalPatient(candidate);
  }
}
