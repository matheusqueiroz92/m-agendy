import { describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { ForbiddenError } from "@/core/shared/domain/errors";

import { NotificationView } from "../ports/notification-reader";
import { FakeNotificationReader } from "../testing/fake-notification-reader";
import { CountUnreadNotificationsUseCase } from "./count-unread-notifications";

const unread = (id: string): NotificationView => ({
  id,
  type: "appointment_confirmed",
  title: "Consulta confirmada",
  appointmentId: null,
  readAt: null,
  createdAt: new Date(),
});

describe("CountUnreadNotificationsUseCase", () => {
  const member = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "staff" }],
  });

  it("retorna a contagem de não lidas para um membro da clínica", async () => {
    const reader = new FakeNotificationReader();
    reader.items = [unread("1"), unread("2"), unread("3")];
    const useCase = new CountUnreadNotificationsUseCase(reader, new Authorizer());

    expect(await useCase.execute({ actor: member, clinicId: "clinic-1" })).toBe(
      3,
    );
  });

  it("barra quem não é da clínica", async () => {
    const useCase = new CountUnreadNotificationsUseCase(
      new FakeNotificationReader(),
      new Authorizer(),
    );
    await expect(
      useCase.execute({ actor: member, clinicId: "clinic-2" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
