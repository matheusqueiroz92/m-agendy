import { describe, expect, it } from "vitest";

import { resolveLandingRoute } from "./landing-route";

const base = {
  isPlatformAdmin: false,
  isClinicBlocked: false,
  hasClinic: false,
  hasPlan: false,
  isPatient: false,
};

describe("resolveLandingRoute", () => {
  it("admin de plataforma vai para /platform (precedência máxima)", () => {
    expect(
      resolveLandingRoute({
        ...base,
        isPlatformAdmin: true,
        isClinicBlocked: true,
        hasClinic: true,
      }),
    ).toBe("/platform");
  });

  it("clínica bloqueada vai para /clinic-suspended (antes do plano)", () => {
    expect(
      resolveLandingRoute({
        ...base,
        isClinicBlocked: true,
        hasClinic: true,
        hasPlan: false,
      }),
    ).toBe("/clinic-suspended");
  });

  it("equipe com plano vai para o dashboard", () => {
    expect(
      resolveLandingRoute({ ...base, hasClinic: true, hasPlan: true }),
    ).toBe("/dashboard");
  });

  it("equipe sem plano vai para assinatura", () => {
    expect(resolveLandingRoute({ ...base, hasClinic: true })).toBe(
      "/new-subscription",
    );
  });

  it("paciente sem clínica vai para o portal", () => {
    expect(resolveLandingRoute({ ...base, isPatient: true })).toBe("/portal");
  });

  it("sem clínica e sem paciente vai para onboarding", () => {
    expect(resolveLandingRoute(base)).toBe("/clinic-form");
  });
});
