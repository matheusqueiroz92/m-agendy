import { randomUUID } from "node:crypto";

import type { FullConfig } from "@playwright/test";

/**
 * Setup global do Playwright: roda uma vez, antes de todos os testes, num
 * processo Node separado dos workers. Semeia os dados fixos que os specs
 * precisam e expõe os IDs/credenciais via `process.env` — os workers do
 * Playwright herdam o env do processo principal, então isso chega aos testes
 * (ver `e2e/booking.spec.ts`, `e2e/auth.spec.ts`, `e2e/trial-expiration.spec.ts`).
 *
 * Usa imports relativos (não o alias `@/...`) de propósito: este arquivo roda
 * fora do build do Next.js, então não depende do bundler resolver o alias.
 *
 * SEGURANÇA: mesma trava dos testes de integração — exige TEST_DATABASE_URL
 * explícito antes de tocar no banco (nunca aponte para um banco real).
 */
export default async function globalSetup(_config: FullConfig) {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!testDatabaseUrl) {
    throw new Error(
      "TEST_DATABASE_URL não definida. Os testes E2E semeiam e limpam dados " +
        "reais no banco — nunca aponte para desenvolvimento/produção.",
    );
  }
  process.env.DATABASE_URL = testDatabaseUrl;

  // Imports dinâmicos, depois de garantir DATABASE_URL: `../src/db` monta o
  // client do Drizzle no import (lê `process.env.DATABASE_URL`).
  const { db } = await import("../src/db");
  const schema = await import("../src/db/schema");
  const { hashPassword } = await import("better-auth/crypto");

  // Limpa o banco de teste antes de semear (idempotente entre execuções locais).
  const tables = [
    "appointment_reminders",
    "notifications",
    "audit_logs",
    "whatsapp_conversations",
    "follow_ups",
    "prescriptions",
    "diagnoses",
    "clinical_attendances",
    "medical_records",
    "appointments",
    "doctor_availability_windows",
    "patients",
    "doctors",
    "users_to_clinics",
    "clinics",
    "verifications",
    "accounts",
    "sessions",
    "users",
  ];
  const { sql } = await import("drizzle-orm");
  await db.execute(
    sql.raw(`TRUNCATE TABLE ${tables.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE;`),
  );

  // --- Clínica pública para o teste de agendamento (sem autenticação) ------
  const [bookingClinic] = await db
    .insert(schema.clinicsTable)
    .values({ name: "Clínica E2E", type: "medical" })
    .returning();

  const [bookingDoctor] = await db
    .insert(schema.doctorsTable)
    .values({
      clinicId: bookingClinic.id,
      name: "Dr. E2E",
      speciality: "Clínico Geral",
      appointmentPriceInCents: 20000,
      defaultAppointmentDurationInMinutes: 30,
    })
    .returning();

  await db.insert(schema.doctorAvailabilityWindowsTable).values(
    [1, 2, 3, 4, 5, 6].map((weekDay) => ({
      doctorId: bookingDoctor.id,
      weekDay,
      startTime: "08:00:00",
      endTime: "20:00:00",
    })),
  );

  process.env.E2E_BOOKING_CLINIC_ID = bookingClinic.id;
  process.env.E2E_BOOKING_DOCTOR_ID = bookingDoctor.id;

  // --- Usuário com assinatura ativa (login/logout) --------------------------
  const activeUserPassword = "SenhaDeTeste123!";
  const activeUserEmail = `e2e-ativo-${randomUUID()}@teste.m-agendy.dev`;
  const activeUser = await createLoginableUser(db, schema, hashPassword, {
    email: activeUserEmail,
    password: activeUserPassword,
    name: "Dono Ativo E2E",
    plan: "premium",
    planExpiresAt: null,
  });

  process.env.E2E_ACTIVE_USER_EMAIL = activeUserEmail;
  process.env.E2E_ACTIVE_USER_PASSWORD = activeUserPassword;
  process.env.E2E_ACTIVE_USER_CLINIC_ID = activeUser.clinicId;

  // --- Usuário com trial expirado (deve cair em /new-subscription) ---------
  const trialUserPassword = "SenhaDeTeste123!";
  const trialUserEmail = `e2e-trial-vencido-${randomUUID()}@teste.m-agendy.dev`;
  await createLoginableUser(db, schema, hashPassword, {
    email: trialUserEmail,
    password: trialUserPassword,
    name: "Dono Trial Vencido E2E",
    plan: "trial",
    planExpiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // ontem
  });

  process.env.E2E_EXPIRED_TRIAL_USER_EMAIL = trialUserEmail;
  process.env.E2E_EXPIRED_TRIAL_USER_PASSWORD = trialUserPassword;
}

async function createLoginableUser(
  db: (typeof import("../src/db"))["db"],
  schema: typeof import("../src/db/schema"),
  hashPassword: (password: string) => Promise<string>,
  params: {
    email: string;
    password: string;
    name: string;
    plan: string;
    planExpiresAt: Date | null;
  },
) {
  const now = new Date();
  const userId = randomUUID();

  await db.insert(schema.usersTable).values({
    id: userId,
    name: params.name,
    email: params.email,
    emailVerified: true, // pula a verificação por e-mail (fluxo real testado à parte)
    plan: params.plan,
    planExpiresAt: params.planExpiresAt,
    createdAt: now,
    updatedAt: now,
  });

  // Conta de credenciais (e-mail/senha) no formato que o BetterAuth espera —
  // usa o mesmo `hashPassword` que o BetterAuth usa internamente, para o
  // login real pela UI funcionar.
  await db.insert(schema.accountsTable).values({
    id: randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: await hashPassword(params.password),
    createdAt: now,
    updatedAt: now,
  });

  const [clinic] = await db
    .insert(schema.clinicsTable)
    .values({ name: `Clínica de ${params.name}`, type: "medical" })
    .returning();

  await db.insert(schema.usersToClinicsTable).values({
    userId,
    clinicId: clinic.id,
    role: "owner",
  });

  return { userId, clinicId: clinic.id };
}
