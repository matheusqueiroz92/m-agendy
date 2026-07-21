import { and, eq, notInArray } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { formatInClinicTimezone } from "@/core/shared/domain/combine-date-and-time";

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

    // Compara a data-calendário no fuso da clínica (CLINIC_TIMEZONE), não no
    // fuso local do processo. `appointment.date` é um instante UTC correto
    // (ex.: 22:00 BRT vira 01:00 UTC do dia seguinte); usar
    // `getFullYear()/getMonth()/getDate()` (fuso do runtime, UTC na Vercel)
    // classificaria esse agendamento no dia errado.
    return appointments
      .filter((appointment) => {
        const appointmentDateStr = formatInClinicTimezone(
          appointment.date,
          "YYYY-MM-DD",
        );
        return appointmentDateStr === params.date;
      })
      .map((appointment) => ({
        start: appointment.date,
        end: addMinutes(appointment.date, appointment.durationInMinutes),
      }));
  }
}
