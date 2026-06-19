import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { doctorsTable, patientsTable } from "@/db/schema";

import {
  AppointmentContact,
  AppointmentContactDirectory,
} from "../../application/ports/appointment-contact-directory";

/** Adapter Drizzle do AppointmentContactDirectory. */
export class DrizzleAppointmentContactDirectory
  implements AppointmentContactDirectory
{
  async getContact(params: {
    clinicId: string;
    patientId: string;
    doctorId: string;
  }): Promise<AppointmentContact | null> {
    const [patient, doctor] = await Promise.all([
      db.query.patientsTable.findFirst({
        where: and(
          eq(patientsTable.id, params.patientId),
          eq(patientsTable.clinicId, params.clinicId),
        ),
      }),
      db.query.doctorsTable.findFirst({
        where: and(
          eq(doctorsTable.id, params.doctorId),
          eq(doctorsTable.clinicId, params.clinicId),
        ),
      }),
    ]);

    if (!patient) {
      return null;
    }

    return {
      patientName: patient.name,
      patientPhoneNumber: patient.phoneNumber,
      doctorName: doctor?.name ?? null,
    };
  }
}
