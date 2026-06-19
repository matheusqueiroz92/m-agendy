import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";

import { ProfessionalAvailability } from "../../domain/availability";
import { AvailabilityReader } from "../../application/ports/availability-reader";

/** Adapter Drizzle do AvailabilityReader. */
export class DrizzleAvailabilityReader implements AvailabilityReader {
  async getAvailability(params: {
    clinicId: string;
    doctorId: string;
  }): Promise<ProfessionalAvailability | null> {
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
      availableFromWeekDay: doctor.availableFromWeekDay,
      availableToWeekDay: doctor.availableToWeekDay,
      availableFromTime: doctor.availableFromTime,
      availableToTime: doctor.availableToTime,
    };
  }

  async getBookedTimes(params: {
    clinicId: string;
    doctorId: string;
    date: string;
  }): Promise<string[]> {
    const appointments = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.doctorId, params.doctorId),
        eq(appointmentsTable.clinicId, params.clinicId),
      ),
    });

    const [year, month, day] = params.date.split("-").map(Number);
    const targetDateStr = new Date(year, month - 1, day)
      .toISOString()
      .split("T")[0];

    return appointments
      .filter((appointment) => {
        const appointmentDateStr = new Date(appointment.date)
          .toISOString()
          .split("T")[0];
        return appointmentDateStr === targetDateStr;
      })
      .map((appointment) => {
        const date = new Date(appointment.date);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
      });
  }
}
