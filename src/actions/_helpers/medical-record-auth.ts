import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

/**
 * Autentica o usuário, garante que ele tem uma clínica e que o paciente
 * informado pertence a essa clínica. Retorna o clinicId para uso na action.
 *
 * Centraliza a verificação de acesso usada por todas as actions do prontuário
 * eletrônico (DRY), evitando repetir a mesma checagem em cada arquivo.
 */
export const assertPatientAccess = async (patientId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!session.user.clinic?.id) {
    throw new Error("Clinic not found");
  }

  const clinicId = session.user.clinic.id;

  const patient = await db.query.patientsTable.findFirst({
    where: eq(patientsTable.id, patientId),
  });

  if (!patient || patient.clinicId !== clinicId) {
    throw new Error("Paciente não encontrado");
  }

  return { clinicId, patientId };
};
