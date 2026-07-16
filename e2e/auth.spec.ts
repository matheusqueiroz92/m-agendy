import { expect, test } from "@playwright/test";

/**
 * Login/logout com um usuário já com assinatura ativa (semeado em
 * `global-setup.ts`, env `E2E_ACTIVE_USER_EMAIL`/`E2E_ACTIVE_USER_PASSWORD`).
 * Cobre o caminho feliz: /auth → login → /dashboard; logout → /auth.
 */

const credentials = () => {
  const email = process.env.E2E_ACTIVE_USER_EMAIL;
  const password = process.env.E2E_ACTIVE_USER_PASSWORD;
  if (!email || !password) {
    throw new Error("Credenciais do usuário ativo não definidas pelo global-setup.");
  }
  return { email, password };
};

test.describe("Autenticação", () => {
  test("login com assinatura ativa vai para o dashboard; logout volta para /auth", async ({
    page,
  }) => {
    const { email, password } = credentials();

    await page.goto("/auth");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.waitForURL("**/dashboard", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByRole("button", { name: "Sair" }).click();
    await page.waitForURL("**/auth", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/auth$/);
  });

  test("acessar /dashboard sem sessão redireciona para /auth", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth$/);
  });

  test("credenciais inválidas mostram erro e não navegam", async ({ page }) => {
    await page.goto("/auth");
    await page.getByLabel("E-mail").fill("nao-existe@teste.m-agendy.dev");
    await page.getByLabel("Senha").fill("SenhaErrada123!");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible();
    await expect(page).toHaveURL(/\/auth$/);
  });
});
