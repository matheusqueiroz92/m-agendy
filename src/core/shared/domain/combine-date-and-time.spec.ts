import { describe, expect, it } from "vitest";

import {
  combineDateAndTimeInClinicTimezone,
  formatInClinicTimezone,
} from "./combine-date-and-time";

describe("combineDateAndTimeInClinicTimezone", () => {
  it("interpreta o horário no fuso do Brasil (UTC-3), independente do fuso de quem chama", () => {
    const date = new Date(Date.UTC(2026, 6, 25)); // 2026-07-25, meia-noite UTC
    const result = combineDateAndTimeInClinicTimezone(date, "10:00");

    // 10:00 em São Paulo (UTC-3) = 13:00 UTC.
    expect(result.toISOString()).toBe("2026-07-25T13:00:00.000Z");
  });

  it("funciona para horários perto da virada do dia (cruza para o dia seguinte em UTC)", () => {
    const date = new Date(Date.UTC(2026, 6, 25));
    const result = combineDateAndTimeInClinicTimezone(date, "23:30");

    // 23:30 em São Paulo (UTC-3) = 02:30 UTC do dia seguinte.
    expect(result.toISOString()).toBe("2026-07-26T02:30:00.000Z");
  });

  it("ignora qualquer componente de hora já presente no Date de entrada (usa só ano/mês/dia em UTC)", () => {
    const date = new Date("2026-07-25T18:45:00.000Z");
    const result = combineDateAndTimeInClinicTimezone(date, "08:00");

    expect(result.toISOString()).toBe("2026-07-25T11:00:00.000Z");
  });

  it("preenche minutos e horas com zero à esquerda corretamente", () => {
    const date = new Date(Date.UTC(2026, 0, 5));
    const result = combineDateAndTimeInClinicTimezone(date, "07:05");

    expect(result.toISOString()).toBe("2026-01-05T10:05:00.000Z");
  });
});

describe("formatInClinicTimezone", () => {
  it("formata um instante UTC no horário de Brasília, independente do fuso de quem chama", () => {
    // 13:00 UTC = 10:00 em São Paulo (UTC-3).
    const instant = new Date("2026-07-25T13:00:00.000Z");

    expect(formatInClinicTimezone(instant, "DD/MM/YYYY [às] HH:mm")).toBe(
      "25/07/2026 às 10:00",
    );
  });

  it("é o inverso de combineDateAndTimeInClinicTimezone", () => {
    const date = new Date(Date.UTC(2026, 6, 25));
    const instant = combineDateAndTimeInClinicTimezone(date, "14:30");

    expect(formatInClinicTimezone(instant, "HH:mm")).toBe("14:30");
  });
});
