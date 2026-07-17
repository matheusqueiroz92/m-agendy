import { resolve } from "node:path";

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    // Foco em testes de domínio/aplicação (rápidos, sem infraestrutura).
    include: ["src/**/*.spec.ts"],
    // CRÍTICO: "*.spec.ts" casa por sufixo, então também casaria com
    // "*.integration.spec.ts" se não excluído explicitamente aqui. Os testes
    // de integração só devem rodar via `vitest.integration.config.ts`
    // (`npm run test:integration`), que carrega `vitest.integration.setup.ts`
    // e aponta DATABASE_URL para TEST_DATABASE_URL antes de qualquer TRUNCATE.
    // Sem esta exclusão, `npm test` roda os testes de integração contra o
    // DATABASE_URL real do .env e trunca as tabelas da aplicação de verdade.
    exclude: [...configDefaults.exclude, "src/**/*.integration.spec.ts"],
  },
});
