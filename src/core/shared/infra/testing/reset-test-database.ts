import { sql } from "drizzle-orm";

import { db } from "@/db";

/**
 * Todas as tabelas da aplicação, na ordem em que aparecem em `db/schema.ts`.
 * `TRUNCATE ... CASCADE` não exige ordem de dependência, mas mantemos a lista
 * explícita (em vez de introspectar o schema) para ficar óbvio o que é
 * limpo — e para o TypeScript acusar erro se uma tabela nova não for incluída
 * aqui quando algum teste de integração referenciá-la.
 */
const ALL_TABLES = [
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
  "patients",
  "doctors",
  "users_to_clinics",
  "clinics",
  "verifications",
  "accounts",
  "sessions",
  "users",
] as const;

/**
 * Limpa todas as tabelas do banco de teste. Chamar em `beforeEach` (ou
 * `afterEach`) de cada suíte de integração para isolar os casos entre si.
 *
 * SEGURANÇA: só roda depois que `vitest.integration.setup.ts` garante que
 * `DATABASE_URL` aponta para `TEST_DATABASE_URL` — nunca chame isto fora dos
 * testes de integração.
 */
export async function resetTestDatabase(): Promise<void> {
  const tableList = ALL_TABLES.map((table) => `"${table}"`).join(", ");
  await db.execute(sql.raw(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE;`));
}
