import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";

import { PatientAccessChecker } from "../../application/ports/patient-access";

/** Verifica, via Drizzle, se o paciente pertence à clínica informada. */
export class DrizzlePatientAccessChecker implements PatientAccessChecker {
  async belongsToClinic(params: {
    patientId: string;
    clinicId: string;
  }): Promise<boolean> {
    const patient = await db.query.patientsTable.findFirst({
      where: and(
        eq(patientsTable.id, params.patientId),
        eq(patientsTable.clinicId, params.clinicId),
      ),
    });

    return Boolean(patient);
  }
}
