import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

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
  },
});
