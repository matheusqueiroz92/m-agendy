/**
 * Setup global dos testes de integração. Roda uma vez antes da suíte.
 *
 * Trava de segurança: os testes de integração fazem TRUNCATE nas tabelas
 * entre casos (ver `resetTestDatabase`). Sem `TEST_DATABASE_URL` explícito,
 * recusa rodar — para nunca truncar acidentalmente um banco de
 * desenvolvimento ou produção só porque `DATABASE_URL` estava setado no shell.
 */
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL não definida. Defina-a explicitamente apontando para " +
      "um banco de TESTE (ex.: o Postgres do docker-compose.yml ou o service " +
      "do CI) antes de rodar `npm run test:integration`. Os testes truncam " +
      "tabelas entre casos — nunca aponte para um banco real.",
  );
}

// `src/db/index.ts` lê `process.env.DATABASE_URL` no import — sobrescreve
// aqui, antes de qualquer teste importar o client do Drizzle.
process.env.DATABASE_URL = testDatabaseUrl;
