import { describe, expect, it } from "vitest";

import { resolveClinicAccess } from "./clinic-access";

const now = new Date("2026-06-19T12:00:00.000Z");

describe("resolveClinicAccess", () => {
  it("bloqueada: sem acesso e sem plano", () => {
    const r = resolveClinicAccess({
      status: "blocked",
      planOverride: "premium",
      planOverrideExpiresAt: null,
      basePlan: "premium",
      basePlanExpiresAt: null,
      now,
    });
    expect(r).toEqual({ isBlocked: true, effectivePlan: null, hasActivePlan: false });
  });

  it("override válido tem precedência sobre o plano base", () => {
    const r = resolveClinicAccess({
      status: "active",
      planOverride: "premium",
      planOverrideExpiresAt: new Date("2026-12-31T00:00:00.000Z"),
      basePlan: null,
      basePlanExpiresAt: null,
      now,
    });
    expect(r.effectivePlan).toBe("premium");
    expect(r.hasActivePlan).toBe(true);
  });

  it("override expirado é ignorado; vale o plano base", () => {
    const r = resolveClinicAccess({
      status: "active",
      planOverride: "premium",
      planOverrideExpiresAt: new Date("2026-01-01T00:00:00.000Z"),
      basePlan: null,
      basePlanExpiresAt: null,
      now,
    });
    expect(r.effectivePlan).toBeNull();
    expect(r.hasActivePlan).toBe(false);
  });

  it("sem override, usa o plano base", () => {
    const r = resolveClinicAccess({
      status: "active",
      planOverride: null,
      planOverrideExpiresAt: null,
      basePlan: "premium",
      basePlanExpiresAt: null,
      now,
    });
    expect(r.effectivePlan).toBe("premium");
    expect(r.hasActivePlan).toBe(true);
  });

  it("override sem expiração é permanente", () => {
    const r = resolveClinicAccess({
      status: "active",
      planOverride: "premium",
  