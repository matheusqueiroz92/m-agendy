import { describe, expect, it } from "vitest";

import { ForbiddenError } from "@/core/shared/domain/errors";

import { AuthenticatedActor } from "../domain/authenticated-actor";
import { ClinicRole } from "../domain/roles";
import { Authorizer } from "./authorizer";

const actorWithRole = (role: ClinicRole) =>
  new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role }],
  });

const platformAdmin = new AuthenticatedActor({
  userId: "admin",
  platformRole: "platform_admin",
  memberships: [],
});

describe("Authorizer.assertCanAccessClinicalData", () => {
  const authorizer = new Authorizer();

  it.each(["owner", "manager", "professional"] as ClinicRole[])(
    "permite o papel %s",
    (role) => {
      expect(() =>
        authorizer.assertCanAccessClinicalData(actorWithRole(role), "clinic-1"),
      ).not.toThrow();
    },
  );

  it("barra o papel staff", () => {
    expect(() =>
      authorizer.assertCanAccessClinicalData(actorWithRole("staff"), "clinic-1"),
    ).toThrow(ForbiddenError);
    expect(
      authorizer.canAccessClinicalData(actorWithRole("staff"), "clinic-1"),
    ).toBe(false);
  });

  it("permite o admin de plataforma", () => {
    expect(() =>
      authorizer.assertCanAccessClinicalData(platformAdmin, "clinic-1"),
    ).not.toThrow();
  });

  it("barra membro de outra clínica", () => {
    expect(() =>
      authorizer.assertCanAccessClinicalData(actorWithRole("owner"), "clinic-2"),
    ).toThrow(ForbiddenError);
  });
});
