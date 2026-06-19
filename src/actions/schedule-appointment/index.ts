"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { makeScheduleAppointment } from "@/core/modules/scheduling/infra/factories/make-schedule-appointment";
import { DomainError } from "@/core/shared/domain/domain-error";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

/**
 * EXEMPLO de "delivery shell" na arquitetura hexagonal.
 *
 * Esta Server Action não contém regra de negócio: ela apenas (1) autentica,
 * (2) traduz o input externo para o input do caso de uso e (3) traduz erros de
 * domínio em mensagens. Toda a lógica vive em ScheduleAppointmentUseCase, que é
 * testado isoladamente. Coexiste com a action upsert-appointment existente;
 * serve como referência do padrão a ser seguido nas próximas features.
 */
const schema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  scheduledAt: z.date(),
  priceInCents: z.number().int().positive(),
  patientName: z.string().optional(),
  patientPhoneNumber: z.string().optional(),
  doctorName: z.string().optional(),
});

export const scheduleAppointment = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!session.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    const useCase = makeScheduleAppointment();

    try {
      const result = await useCase.execute({
        clinicId: session.user.clinic.id,
        patientId: parsedInput.patientId,
        doctorId: parsedInput.doctorId,
        scheduledAt: parsedInput.scheduledAt,
        priceInCents: parsedInput.priceInCents,
        patientName: parsedInput.patientName,
        patientPhoneNumber: parsedInput.patientPhoneNumber,
        doctorName: parsedInput.doctorName,
      });

      revalidatePath("/appointments");
      revalidatePath("/dashboard");

      return result;
    } catch (error) {
      // Erros de domínio carregam mensagens prontas para o usuário.
      if (error instanceof DomainError) {
        throw new Error(error.message);
      }
      throw error;
    }
  });
