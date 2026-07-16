import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

/**
 * Config separada para testes de integração (batem em Postgres de verdade),
 * mantendo `vitest.config.ts` rápido e sem infraestrutura para os testes de
 * unidade (`npm run test`). Rode com `npm run test:integration`.
 *
 * Exige `TEST_DATABASE_URL` (ver `vitest.integration.setup.ts`) — nunca aponte
 * para o banco de desenvolvimento/produção: os testes fazem TRUNCATE entre
 * casos.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.integration.spec.ts"],
    setupFiles: ["./vitest.integration.setup.ts"],
    // Testes de integração fazem I/O real (rede/disco) e não devem rodar em
    // paralelo dentro do mesmo processo: o reset de tabelas de um teste não
    // pode correr com uma query de outro teste ainda em andamento.
    fileParallelism: false,
    hookTimeout: 30_000,
    testTimeout: 20_000,
  },
});
