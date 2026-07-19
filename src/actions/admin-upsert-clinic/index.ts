"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { CLINIC_TYPES } from "@/core/modules/clinics/domain/clinic-type";
import { makeUpsertClinic } from "@/core/modules/clinics/infra/factories/make-admin-clinic-use-cases";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

const schema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, "Nome obrigatório"),
    type: z.enum(CLINIC_TYPES),
    // Responsável — obrigatório só na criação; a regra "de verdade" mora no
    // UpsertClinicUseCase (esta é a validação de forma da casca).
    ownerName: z.string().trim().min(1).optional(),
    ownerEmail: z.string().trim().email("E-mail do responsável inválido").optional(),
    ownerPhoneNumber: z.string().trim().optional(),
  })
  .refine((data) => Boolean(data.id) || Boolean(data.ownerName && data.ownerEmail), {
    message: "Nome e e-mail do responsável são obrigatórios ao criar uma clínica.",
    path: ["ownerEmail"],
  });

/** Casca de delivery. Regra no UpsertClinicUseCase (admin de plataforma). */
export const adminUpsertClinic = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) throw new UnauthorizedError();

    await makeUpsertClinic().execute({
      actor,
      id: parsedInput.id,
      name: parsedInput.name,
      type: parsedInput.type,
      ownerName: parsedInput.ownerName,
      ownerEmail: parsedInput.ownerEmail,
      ownerPhoneNumber: parsedInput.ownerPhoneNumber,
    });

    revalidatePath("/platform/clinics");
  });
