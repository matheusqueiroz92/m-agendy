import { randomUUID } from "node:crypto";

import { db } from "@/db";
import {
  clinicsTable,
  clinicTypeEnum,
  doctorsTable,
  patientsTable,
  usersTable,
  usersToClinicsTable,
} from "@/db/schema";

type ClinicType = (typeof clinicTypeEnum.enumValues)[number];

/**
 * Fábricas de dados mínimas para os testes de integração — só o essencial
 * para satisfazer as colunas `NOT NULL` do schema, com overrides opcionais.
 * Evita duplicar "monte um usuário/clínica/médico válido" em cada teste.
 */

export async function seedUser(overrides: Partial<typeof usersTable.$inferInsert> = {}) {
  const now = new Date();
  const [user] = await db
    .insert(usersTable)
    .values({
      id: randomUUID(),
      name: "Usuário de Teste",
      email: `user-${randomUUID()}@teste.m-agendy.dev`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    })
    .returning();
  return user;
}

export async function seedClinic(
  overrides: Partial<typeof clinicsTable.$inferInsert> & { type?: ClinicType } = {},
) {
  const [clinic] = await db
    .insert(clinicsTable)
    .values({
      name: "Clínica de Teste",
      type: "medical",
      ...overrides,
    })
    .returning();
  return clinic;
}

export async function seedDoctor(
  clinicId: string,
  overrides: Partial<typeof doctorsTable.$inferInsert> = {},
) {
  const [doctor] = await db
    .insert(doctorsTable)
    .values({
      clinicId,
      name: "Dr. Teste",
      speciality: "Clínico Geral",
      availableFromWeekDay: 1,
      availableToWeekDay: 5,
      availableFromTime: "08:00",
      availableToTime: "18:00",
      appointmentPriceInCents: 20000,
      ...overrides,
    })
    .returning();
  return doctor;
}

export async function seedPatient(
  clinicId: string,
  overrides: Partial<typeof patientsTable.$inferInsert> = {},
) {
  const [patient] = await db
    .insert(patientsTable)
    .values({
      clinicId,
      name: "Paciente de Teste",
      email: `patient-${randomUUID()}@teste.m-agendy.dev`,
      phoneNumber: "+5511999999999",
      sex: "female",
      ...overrides,
    })
    .returning();
  return patient;
}

export async function linkUserToClinic(
  userId: string,
  clinicId: string,
  role: (typeof usersToClinicsTable.$inferInsert)["role"] = "owner",
) {
  await db.insert(usersToClinicsTable).values({ userId, clinicId, role });
}

/**
 * Atalho: cria clínica + dono + médico num só passo, cobrindo o caso comum
 * dos testes de repositório/rota que só precisam de um tenant válido.
 */
export async function seedClinicWithOwnerAndDoctor(
  overrides: {
    clinic?: Partial<typeof clinicsTable.$inferInsert>;
    doctor?: Partial<typeof doctorsTable.$inferInsert>;
  } = {},
) {
  const clinic = await seedClinic(overrides.clinic);
  const owner = await seedUser();
  await linkUserToClinic(owner.id, clinic.id, "owner");
  const doctor = await seedDoctor(clinic.id, overrides.doctor);

  return { clinic, owner, doctor };
}
