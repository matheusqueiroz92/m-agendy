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
 *
 * TRAVA EM PROFUNDIDADE: mesmo que um config de teste errado acabe incluindo
 * este arquivo (já aconteceu — `vitest.config.ts` truncou um banco Neon real
 * porque seu `include` casava por sufixo com `*.integration.spec.ts`), esta
 * função se recusa a rodar um TRUNCATE a menos que `DATABASE_URL` seja,
 * literalmente, igual a `TEST_DATABASE_URL`. Não confie só na configuração do
 * Vitest para isso.
 */
export async function resetTestDatabase(): Promise<void> {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!testDatabaseUrl || process.env.DATABASE_URL !== testDatabaseUrl) {
    throw new Error(
      "resetTestDatabase() abortado: DATABASE_URL não corresponde a " +
        "TEST_DATABASE_URL. Isso indica que este código está rodando fora do " +
        "fluxo de testes de integração (vitest.integration.setup.ts) — " +
        "prosseguir arriscaria truncar um banco real.",
    );
  }

  const tableList = ALL_TABLES.map((table) => `"${table}"`).join(", ");
  await db.execute(sql.raw(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE;`));
}
