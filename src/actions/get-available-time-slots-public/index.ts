"use server";

import { z } from "zod";

import { makeGetAvailableTimeSlots } from "@/core/modules/scheduling/infra/factories/make-get-available-time-slots";
import { DomainError } from "@/core/shared/domain/domain-error";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  clinicId: z.string().uuid(),
  doctorId: z.string().uuid(),
  date: z.string().date(), // YYYY-MM-DD
});

/**
 * Versão PÚBLICA (sem autenticação) usada pelo agendamento online: recebe a
 * clínica pelo link e devolve apenas os horários, com flag de disponibilidade.
 */
export const getAvailableTimeSlotsPublic = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    try {
      return await makeGetAvailableTimeSlots().execute(parsedInput);
    } catch (error) {
      if (error instanceof DomainError) {
        throw new Error(error.message);
      }
      throw error;
    }
  });
