import { expect, test } from "@playwright/test";

/**
 * Jornada mais crítica do funil: paciente agenda consulta pelo link público,
 * sem autenticação. Clínica + profissional semeados em `global-setup.ts`
 * (env `E2E_BOOKING_CLINIC_ID`).
 *
 * NOTA: a interação com o `DatePicker` (react-day-picker) é a parte mais
 * sensível deste teste — o texto acessível exato do dia no calendário não foi
 * validado contra o app rodando de verdade neste ambiente. Se o seletor do
 * dia falhar na primeira execução real, ajuste `pickFirstAvailableDay` abaixo
 * (o resto do fluxo — seleção de profissional, horário e envio — usa
 * labels/roles estáveis do ShadCN e não deveria precisar de ajuste).
 */

const clinicId = () => {
  const id = process.env.E2E_BOOKING_CLINIC_ID;
  if (!id) throw new Error("E2E_BOOKING_CLINIC_ID não definido pelo global-setup.");
  return id;
};

test.describe("Agendamento público", () => {
  test("paciente agenda consulta escolhendo profissional, data e horário", async ({
    page,
  }) => {
    await page.goto(`/agendar/${clinicId()}`);

    await expect(page.getByRole("heading", { name: "Clínica E2E" })).toBeVisible();

    // 1) Profissional (Select do ShadCN — clínica seedada é do tipo "medical",
    // então o rótulo é "Médico"; ver clinic-type.ts).
    await page.getByRole("combobox", { name: "Médico" }).click();
    await page.getByRole("option", { name: /Dr\. E2E/ }).click();

    // 2) Data — abre o calendário e escolhe o primeiro dia habilitado.
    await page.getByRole("button", { name: "Selecione uma data" }).click();
    await pickFirstAvailableDay(page);

    // 3) Horário — só habilita depois que a data é escolhida.
    await page.getByRole("combobox", { name: "Horário" }).click();
    await page.getByRole("option").first().click();

    // 4) Dados do paciente
    await page.getByLabel("Seu nome").fill("Paciente E2E");
    await page.getByLabel("E-mail").fill(`paciente-e2e-${Date.now()}@teste.dev`);
    await page.getByLabel("Telefone (WhatsApp)").fill("11999999999");
    await page.getByRole("combobox", { name: "Sexo" }).click();
    await page.getByRole("option", { name: "Feminino" }).click();

    await page.getByRole("button", { name: "Confirmar agendamento" }).click();

    await expect(page.getByText("Agendamento confirmado!")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("mostra o valor da consulta ao escolher o profissional", async ({ page }) => {
    await page.goto(`/agendar/${clinicId()}`);

    await page.getByRole("combobox", { name: "Médico" }).click();
    await page.getByRole("option", { name: /Dr\. E2E/ }).click();

    // appointmentPriceInCents = 20000 → R$ 200,00 (ver global-setup.ts).
    await expect(page.getByText(/R\$\s*200,00/)).toBeVisible();
  });
});

async function pickFirstAvailableDay(page: import("@playwright/test").Page) {
  const enabledDay = page
    .getByRole("gridcell")
    .filter({ has: page.locator("button:not([disabled])") })
    .first();
  await enabledDay.locator("button").click();
}
