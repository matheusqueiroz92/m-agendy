import { describe, expect, it } from "vitest";

import {
  canAddProfessional,
  canCreateAppointment,
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
});
