import { and, eq, or } from "drizzle-orm";

import { db } from "@/db";
import { doctorsTable, patientsTable } from "@/db/schema";

import {
  BookableProfessional,
  BookingDirectory,
  FindOrCreatePatientInput,
} from "../../application/ports/booking-directory";

/** Adapter Drizzle do BookingDirectory (agendamento online). */
export class DrizzleBookingDirectory implements BookingDirectory {
  async getProfessional(params: {
    clinicId: string;
    doctorId: string;
  }): Promise<BookableProfessional | null> {
    const doctor = await db.query.doctorsTable.findFirst({
      where: and(
        eq(doctorsTable.id, params.doctorId),
        eq(doctorsTable.clinicId, params.clinicId),
      ),
    });

    if (!doctor) {
      return null;
    }

    return {
      priceInCents: doctor.appointmentPriceInCents,
      name: doctor.name,
      defaultAppointmentDurationInMinutes:
        doctor.defaultAppointmentDurationInMinutes,
    };
  }

  async findOrCreatePatient(input: FindOrCreatePatientInput): Promise<string> {
    const email = input.email.trim().toLowerCase();
    const phoneNumber = input.phoneNumber.trim();

    const existing = await db.query.patientsTable.findFirst({
      where: and(
        eq(patientsTable.clinicId, input.clinicId),
        or(
          eq(patientsTable.email, email),
          eq(patientsTable.phoneNumber, phoneNumber),
        ),
      ),
    });

    if (existing) {
      return existing.id;
    }

    const [created] = await db
      .insert(patientsTable)
      .values({
        clinicId: input.clinicId,
        name: input.name.trim(),
        email,
        phoneNumber,
        sex: input.sex,
      })
      .returning({ id: patientsTable.id });

    return created.id;
  }
}
