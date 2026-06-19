"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { auth } from "@/lib/auth";
import { makeUpsertProfessional } from "@/core/modules/professionals/infra/factories/make-professional-use-cases";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

import { upsertDoctorSchema } from "./schema";

/**
 * Delivery shell: autentica, resolve a clínica atual e delega ao caso de uso.
 * Regra (autorização, isolamento por clínica, auditoria) no
 * UpsertProfessionalUseCase. O conceito de domínio é "Profissional"; a action
 * mantém o nome "doctor" por compatibilidade com a UI/rotas existentes.
 */
export const upsertDoctor = actionClient
  .schema(upsertDoctorSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }

    const clinicId = resolveCurrentClinicId(actor);
    const session = await auth.api.getSession({ headers: await headers() });

    await makeUpsertProfessional().execute({
      actor,
      clinicId,
      plan: session?.user?.plan ?? null,
      ...parsedInput,
    });

    revalidatePath("/doctors");
  });
