import { describe, expect, it } from "vitest";

import {
  canAddProfessional,
  canCreateAppointment,
  canCreateAppointmentToday,
  isOneAppointmentAwayFromDailyLimit,
  planHasFeature,
} from "./entitlements";

describe("entitlements", () => {
  it("essential limita profissionais a 3", () => {
    expect(canAddProfessional("essential", 2)).toBe(true);
    expect(canAddProfessional("essential", 3)).toBe(false);
  });

  it("gold é ilimitado em profissionais e agendamentos", () => {
    expect(canAddProfessional("gold", 999)).toBe(true);
    expect(canCreateAppointment("gold", 99999)).toBe(true);
  });

  it("essential limita agendamentos/mês a 100", () => {
    expect(canCreateAppointment("essential", 99)).toBe(true);
    expect(canCreateAppointment("essential", 100)).toBe(false);
  });

  it("recursos por plano", () => {
    expect(planHasFeature("premium", "detailedMetrics")).toBe(true);
    expect(planHasFeature("premium", "aiInsights")).toBe(false);
    expect(planHasFeature("gold", "aiInsights")).toBe(true);
    expect(planHasFeature("essential", "detailedMetrics")).toBe(false);
  });

  it("plano inexistente/ausente não libera nada", () => {
    expect(canAddProfessional(null, 0)).toBe(false);
    expect(planHasFeature(undefined, "detailedMetrics")).toBe(false);
  });

  it("essential limita agendamentos/dia a 15", () => {
    expect(canCreateAppointmentToday("essential", 14)).toBe(true);
    expect(canCreateAppointmentToday("essential", 15)).toBe(false);
  });

  it("premium limita agendamentos/dia a 40", () => {
    expect(canCreateAppointmentToday("premium", 39)).toBe(true);
    expect(canCreateAppointmentToday("premium", 40)).toBe(false);
  });

  it("gold é ilimitado em agendamentos/dia", () => {
    expect(canCreateAppointmentToday("gold", 99999)).toBe(true);
  });

  it("avisa quando falta exatamente 1 agendamento para o limite diário", () => {
    // Essential: limite 15. Após criar o 14º do dia, restou espaço para 1.
    expect(isOneAppointmentAwayFromDailyLimit("essential", 14)).toBe(true);
    expect(isOneAppointmentAwayFromDailyLimit("essential", 13)).toBe(false);
    expect(isOneAppointmentAwayFromDailyLimit("essential", 15)).toBe(false);
  });

  it("plano sem limite diário (gold) nunca avisa", () => {
    expect(isOneAppointmentAwayFromDailyLimit("gold", 99999)).toBe(false);
  });

  it("apenas premium e gold liberam número de WhatsApp próprio", () => {
    expect(planHasFeature("essential", "canUseOwnWhatsAppNumber")).toBe(false);
    expect(planHasFeature("premium", "canUseOwnWhatsAppNumber")).toBe(true);
    expect(planHasFeature("gold", "canUseOwnWhatsAppNumber")).toBe(true);
  });
});
