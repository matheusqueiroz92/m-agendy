import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { ForbiddenError } from "@/core/shared/domain/errors";

import { FakeNotificationReader } from "../testing/fake-notification-reader";
import { ViewClinicNotificationsUseCase } from "./view-clinic-notifications";

describe("ViewClinicNotificationsUseCase", () => {
  let reader: FakeNotificationReader;
  let useCase: ViewClinicNotificationsUseCase;

  const member = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "staff" }],
  });

  beforeEach(() => {
    reader = new FakeNotificationReader();
    reader.items = [
      {
        id: "n1",
        type: "appointment.confirmed",
        title: "Maria confirmou",
        appointmentId: "a1",
        readAt: null,
        createdAt: new Date("2026-06-15T12:00:00.000Z"),
      },
    ];
    useCase = new ViewClinicNotificationsUseCase(reader, new Authorizer());
  });

  it("lista e marca como lidas para um membro da clínica", async () => {
    const items = await useCase.execute({
      actor: member,
      clinicId: "clinic-1",
    });

    expect(items).toHaveLength(1);
    expect(reader.markAllReadCalls).toBe(1);
  });

  it("nega para quem não é membro da clínica", async () => {
    const outsider = new AuthenticatedActor({
      userId: "u2",
      platformRole: "member",
      memberships: [{ clinicId: "clinic-2", role: "owner" }],
    });

    await expect(
      useCase.execute({ actor: outsider, clinicId: "clinic-1" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(reader.markAllReadCalls).toBe(0);
  });
});
