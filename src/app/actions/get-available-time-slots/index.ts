"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

const getAvailableTimeSlotsSchema = z.object({
  doctorId: z.string().uuid(),
  date: z.string().date(), // formato YYYY-MM-DD
});

const actionClient = createSafeActionClient();

// Função para gerar slots de 30 em 30 minutos
function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let currentHour = startHour;
  let currentMinute = startMinute;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    const timeSlot = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
    slots.push(timeSlot);

    // Incrementa 30 minutos
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentMinute -= 60;
      currentHour += 1;
    }
  }

  return slots;
}

export const getAvailableTimeSlots = actionClient
  .schema(getAvailableTimeSlotsSchema)
  .action(async ({ parsedInput: { doctorId, date } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/auth");
    }

    if (!session?.user?.clinic) {
      redirect("/clinic-form");
    }

    // Buscar informações do médico
    const doctor = await db.query.doctorsTable.findFirst({
      where: and(
        eq(doctorsTable.id, doctorId),
        eq(doctorsTable.clinicId, session.user.clinic.id),
      ),
    });

    if (!doctor) {
      throw new Error("Médico não encontrado");
    }

    // Verificar se a data está dentro dos dias de trabalho do médico
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    const { availableFromWeekDay, availableToWeekDay } = doctor;

    let isDayAvailable = false;
    if (availableFromWeekDay <= availableToWeekDay) {
      isDayAvailable =
        dayOfWeek >= availableFromWeekDay && dayOfWeek <= availableToWeekDay;
    } else {
      isDayAvailable =
        dayOfWeek >= availableFromWeekDay || dayOfWeek <= availableToWeekDay;
    }

    if (!isDayAvailable) {
      return { availableSlots: [] };
    }

    // Gerar todos os slots possíveis do médico
    const allSlots = generateTimeSlots(
      doctor.availableFromTime,
      doctor.availableToTime,
    );

    // Buscar agendamentos já existentes nesta data para este médico
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.doctorId, doctorId),
        eq(appointmentsTable.clinicId, session.user.clinic.id),
        // Note: precisamos filtrar por data no JavaScript pois é mais complexo com timestamps
      ),
    });

    // Filtrar agendamentos da data específica e extrair horários ocupados
    const occupiedSlots = existingAppointments
      .filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate.toDateString() === selectedDate.toDateString();
      })
      .map((appointment) => {
        const appointmentDate = new Date(appointment.date);
        const hours = appointmentDate.getHours().toString().padStart(2, "0");
        const minutes = appointmentDate
          .getMinutes()
          .toString()
          .padStart(2, "0");
        return `${hours}:${minutes}`;
      });

    // Retornar apenas slots livres
    const availableSlots = allSlots.filter(
      (slot) => !occupiedSlots.includes(slot),
    );

    return { availableSlots };
  });
