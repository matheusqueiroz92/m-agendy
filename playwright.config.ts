import { defineConfig, devices } from "@playwright/test";

/**
 * Config do Playwright (E2E). Roda contra um `next start` real, apontando
 * para o banco de TESTE (mesma trava de segurança dos testes de integração:
 * ver `vitest.integration.setup.ts` e `e2e/global-setup.ts`).
 *
 * Uso local:
 *   1. Suba um Postgres de teste (ex.: `docker compose up postgres -d`).
 *   2. `TEST_DATABASE_URL=postgresql://... npm run test:e2e`
 *      (o script `test:e2e` já builda e sobe o servidor via `webServer` abaixo).
 *
 * No CI, ver `.github/workflows/ci.yml` (job `e2e`).
 */
const PORT = 3000;
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "html",
  timeout: 30_000,

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Sobe o app já buildado (`next start`) contra o banco de teste. Se o
  // servidor já estiver rodando (dev local), reaproveita em vez de subir outro.
  webServer: {
    command: "npm run start",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "",
      NEXT_PUBLIC_APP_URL: BASE_URL,
      PORT: String(PORT),
    },
  },
});
