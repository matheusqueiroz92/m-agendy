import { and, eq, notInArray } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";

import { addMinutes } from "../../domain/availability";
import { AvailabilityReader } from "../../application/ports/availability-reader";

/** Adapter Drizzle do AvailabilityReader. */
export class DrizzleAvailabilityReader implements AvailabilityReader {
  async getAvailability(params: {
    clinicId: string;
    doctorId: string;
  }) {
    const doctor = await db.query.doctorsTable.findFirst({
      where: and(
        eq(doctorsTable.id, params.doctorId),
        eq(doctorsTable.clinicId, params.clinicId),
      ),
      with: {
        availabilityWindows: true,
      },
    });

    if (!doctor) {
      return null;
    }

    return {
      windows: doctor.availabilityWindows.map((window) => ({
        weekDay: window.weekDay,
        startTime: window.startTime,
        endTime: window.endTime,
      })),
      defaultAppointmentDurationInMinutes:
        doctor.defaultAppointmentDurationInMinutes,
    };
  }

  async getOccupiedIntervals(params: {
    clinicId: string;
    doctorId: string;
    date: string;
  }) {
    const appointments = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.doctorId, params.doctorId),
        eq(appointmentsTable.clinicId, params.clinicId),
        notInArray(appointmentsTable.status, ["cancelled", "no_show"]),
      ),
    });

    const [year, month, day] = params.date.split("-").map(Number);
    const targetDateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return appointments
      .filter((appointment) => {
        const d = appointment.date;
        const appointmentDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return appointmentDateStr === targetDateStr;
      })
      .map((appointment) => ({
        start: appointment.date,
        end: addMinutes(appointment.date, appointment.durationInMinutes),
      }));
  }
}
