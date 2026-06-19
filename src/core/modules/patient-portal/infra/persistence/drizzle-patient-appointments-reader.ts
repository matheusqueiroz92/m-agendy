import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";

import {
  PatientAppointmentsReader,
  PortalAppointment,
} from "../../application/ports/patient-appointments-reader";

/** Adapter Drizzle da leitura de consultas do paciente para o portal. */
export class DrizzlePatientAppointmentsReader
  implements PatientAppointmentsReader
{
  async listByPatient(patientId: string): Promise<PortalAppointment[]> {
    const rows = await db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.patientId, patientId),
      orderBy: [desc(appointmentsTable.date)],
      with: {
        doctor: true,
        clinic: true,
      },
    });

    return rows.map((row) => ({
      id: row.id,
      scheduledAt: row.date,
      doctorName: row.doctor.name,
      clinicName: row.clinic.name,
      priceInCents: row.appointmentPriceInCents,
    }));
  }
}
