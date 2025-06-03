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
    // CORREÇÃO: Criar uma nova data baseada na string da data para evitar problemas de timezone
    const [year, month, day] = date.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day); // month é 0-indexed
    const dayOfWeek = selectedDate.getDay();

    const { availableFromWeekDay, availableToWeekDay } = doctor;

    // Debug: log dos dados do médico e data selecionada
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEBUG] Verificação de disponibilidade:`, {
        doctorId,
        doctorName: doctor.name,
        originalDate: date,
        parsedYear: year,
        parsedMonth: month,
        parsedDay: day,
        selectedDate: selectedDate.toISOString(),
        dayOfWeek,
        dayOfWeekName: [
          "Domingo",
          "Segunda",
          "Terça",
          "Quarta",
          "Quinta",
          "Sexta",
          "Sábado",
        ][dayOfWeek],
        availableFromWeekDay,
        availableToWeekDay,
        availableFromWeekDayName: [
          "Domingo",
          "Segunda",
          "Terça",
          "Quarta",
          "Quinta",
          "Sexta",
          "Sábado",
        ][availableFromWeekDay],
        availableToWeekDayName: [
          "Domingo",
          "Segunda",
          "Terça",
          "Quarta",
          "Quinta",
          "Sexta",
          "Sábado",
        ][availableToWeekDay],
      });
    }

    let isDayAvailable = false;
    if (availableFromWeekDay <= availableToWeekDay) {
      isDayAvailable =
        dayOfWeek >= availableFromWeekDay && dayOfWeek <= availableToWeekDay;
    } else {
      isDayAvailable =
        dayOfWeek >= availableFromWeekDay || dayOfWeek <= availableToWeekDay;
    }

    if (!isDayAvailable) {
      return { timeSlots: [] };
    }

    // Gerar todos os slots possíveis do médico
    const allSlots = generateTimeSlots(
      doctor.availableFromTime,
      doctor.availableToTime,
    );

    // Buscar agendamentos já existentes nesta data para este médico
    const existingAppointments = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.doctorId, doctorId),
        eq(appointmentsTable.clinicId, session.user.clinic.id),
      ),
    });

    // Filtrar agendamentos da data específica e extrair horários ocupados
    const targetDateStr = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD

    const occupiedSlots = existingAppointments
      .filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        const appointmentDateStr = appointmentDate.toISOString().split("T")[0]; // YYYY-MM-DD
        return appointmentDateStr === targetDateStr;
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

    // Debug log para verificar o funcionamento
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEBUG] Horários ocupados para ${targetDateStr}:`, {
        doctorId,
        targetDate: targetDateStr,
        allSlots,
        occupiedSlots,
        totalAppointments: existingAppointments.length,
        filteredCount: occupiedSlots.length,
      });
    }

    // Retornar slots com status de disponibilidade
    const timeSlots = allSlots.map((slot) => ({
      time: slot,
      available: !occupiedSlots.includes(slot),
    }));

    // Log final para confirmar resultado
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEBUG] Resultado final:`, {
        timeSlots,
        totalSlots: allSlots.length,
        availableCount: timeSlots.filter((slot) => slot.available).length,
        occupiedCount: timeSlots.filter((slot) => !slot.available).length,
      });
    }

    return { timeSlots };
  });
