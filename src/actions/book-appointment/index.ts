"use server";

import { z } from "zod";

import { makeBookAppointment } from "@/core/modules/scheduling/infra/factories/make-book-appointment";
import { combineDateAndTimeInClinicTimezone } from "@/core/shared/domain/combine-date-and-time";
import { DomainError } from "@/core/shared/domain/domain-error";
import { actionClient } from "@/lib/next-safe-action";

/**
 * Action PÚBLICA de agendamento online (sem autenticação). A autorização é
 * "pública por clínica": qualquer pessoa com o link da clínica pode marcar.
 * Toda a regra vive no BookAppointmentUseCase.
 */
const schema = z.object({
  clinicId: z.string().uuid(),
  doctorId: z.string().uuid(),
  date: z.date(),
  time: z.string().min(1),
  patientName: z.string().trim().min(1, { message: "Informe seu nome." }),
  patientEmail: z.string().trim().email({ message: "E-mail inválido." }),
  patientPhoneNumber: z
    .string()
    .trim()
    .min(1, { message: "Informe seu telefone." }),
  patientSex: z.enum(["male", "female"], { message: "Selecione o sexo." }),
});

export const bookAppointment = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const scheduledAt = combineDateAndTimeInClinicTimezone(
      parsedInput.date,
      parsedInput.time,
    );

    try {
      const result = await makeBookAppointment().execute({
        clinicId: parsedInput.clinicId,
        doctorId: parsedInput.doctorId,
        scheduledAt,
        patientName: parsedInput.patientName,
        patientEmail: parsedInput.patientEmail,
        patientPhoneNumber: parsedInput.patientPhoneNumber,
        patientSex: parsedInput.patientSex,
      });
      return { appointmentId: result.appointmentId };
    } catch (error) {
      if (error instanceof DomainError) {
        throw new Error(error.message);
      }
      throw error;
    }
  });
