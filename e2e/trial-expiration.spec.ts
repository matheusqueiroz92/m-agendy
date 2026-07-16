import { expect, test } from "@playwright/test";

/**
 * O trial sem cartão (ver `docs/08-administracao-e-planos.md`) precisa
 * derrubar o acesso de verdade quando vence — não só deixar de aparecer como
 * "ativo" em algum lugar da UI. Usuário semeado em `global-setup.ts` já com
 * `plan = 'trial'` e `planExpiresAt` no passado.
 */

const credentials = () => {
  const email = process.env.E2E_EXPIRED_TRIAL_USER_EMAIL;
  const password = process.env.E2E_EXPIRED_TRIAL_USER_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Credenciais do usuário com trial expirado não definidas pelo global-setup.",
    );
  }
  return { email, password };
};

test.describe("Expiração do trial", () => {
  test("login com trial vencido cai em /new-subscription, não no dashboard", async ({
    page,
  }) => {
    const { email, password } = credentials();

    await page.goto("/auth");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.waitForURL("**/new-subscription", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/new-subscription$/);
  });

  test("acessar /dashboard direto com trial vencido também redireciona", async ({
    page,
  }) => {
    const { email, password } = credentials();

    await page.goto("/auth");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/new-subscription", { timeout: 10_000 });

    // Mesmo tentando forçar a URL do painel diretamente, o guard do layout
    // protegido (`(protected)/layout.tsx`) deve mandar de volta.
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/new-subscription$/);
  });
});
