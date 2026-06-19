import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { doctorsTable, patientsTable } from "@/db/schema";
import { NotFoundError } from "@/core/shared/domain/errors";

import { AppointmentConflictError } from "../../domain/errors";
import {
  ChatBookingResult,
  ChatScheduler,
} from "../../application/ports/chatbot-ports";
import { makeScheduleAppointment } from "../factories/make-schedule-appointment";

/**
 * Efetiva o agendamento do chatbot reaproveitando o ScheduleAppointmentUseCase
 * (que já dispara confirmação + lembretes). Busca preço do profissional e
 * contato do paciente para alimentar a notificação. Conflito de horário (corrida
 * entre listagem e confirmação) é traduzido em "conflict" para o chatbot tratar.
 */
export class DrizzleChatScheduler implements ChatScheduler {
  async book(params: {
    clinicId: string;
    patientId: string;
    doctorId: string;
    scheduledAt: Date;
  }): Promise<ChatBookingResult> {
    const [doctor, patient] = await Promise.all([
      db.query.doctorsTable.findFirst({
        where: and(
          eq(doctorsTable.id, params.doctorId),
          eq(doctorsTable.clinicId, params.clinicId),
        ),
      }),
      db.query.patientsTable.findFirst({
        where: and(
          eq(patientsTable.id, params.patientId),
          eq(patientsTable.clinicId, params.clinicId),
        ),
      }),
    ]);

    if (!doctor || !patient) {
      throw new NotFoundError("Profissional ou paciente não encontrado.");
    }

    try {
      await makeScheduleAppointment().execute({
        clinicId: params.clinicId,
        patientId: params.patientId,
        doctorId: params.doctorId,
        scheduledAt: params.scheduledAt,
        priceInCents: doctor.appointmentPriceInCents,
        patientName: patient.name,
        patientPhoneNumber: patient.phoneNumber,
        doctorName: doctor.name,
      });
      return "booked";
    } catch (error) {
      if (error instanceof AppointmentConflictError) {
        return "conflict";
      }
      throw error;
    }
  }
}
