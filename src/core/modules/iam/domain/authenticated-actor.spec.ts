import { describe, expect, it } from "vitest";

import { AuthenticatedActor } from "./authenticated-actor";

describe("AuthenticatedActor", () => {
  const makeActor = (overrides = {}) =>
    new AuthenticatedActor({
      userId: "user-1",
      platformRole: "member",
      memberships: [
        { clinicId: "clinic-a", role: "manager" },
        { clinicId: "clinic-b", role: "professional" },
      ],
      ...overrides,
    });

  it("identifica admin de plataforma", () => {
    expect(makeActor().isPlatformAdmin()).toBe(false);
    expect(
      makeActor({ platformRole: "platform_admin" }).isPlatformAdmin(),
    ).toBe(true);
  });

  it("retorna o papel na clínica", () => {
    const actor = makeActor();
    expect(actor.roleInClinic("clinic-a")).toBe("manager");
    expect(actor.roleInClinic("clinic-b")).toBe("professional");
    expect(actor.roleInClinic("clinic-x")).toBeNull();
  });

  it("sabe de quais clínicas é membro", () => {
    const actor = makeActor();
    expect(actor.isMemberOf("clinic-a")).toBe(true);
    expect(actor.isMemberOf("clinic-x")).toBe(false);
  });

  it("permite gerenciar clínica apenas para owner/manager (ou platform admin)", () => {
    const actor = makeActor();
    expect(actor.canManageClinic("clinic-a")).toBe(true); // manager
    expect(actor.canManageClinic("clinic-b")).toBe(false); // professional
    expect(actor.canManageClinic("clinic-x")).toBe(false); // não-membro

    const admin = makeActor({ platformRole: "platform_admin", memberships: [] });
    expect(admin.canManageClinic("clinic-x")).toBe(true);
  });
});
