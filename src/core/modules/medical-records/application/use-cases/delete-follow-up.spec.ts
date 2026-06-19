import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { FollowUp } from "../../domain/follow-up";
import { InMemoryFollowUpRepository } from "../testing/in-memory-follow-up-repository";
import { DeleteFollowUpUseCase } from "./delete-follow-up";

describe("DeleteFollowUpUseCase", () => {
  let followUps: InMemoryFollowUpRepository;
  let audit: FakeAuditLog;
  let useCase: DeleteFollowUpUseCase;

  const professional = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "professional" }],
  });

  const makeFollowUp = (clinicId = "clinic-1") =>
    FollowUp.create({
      clinicId,
      patientId: "patient-1",
      title: "Controle de pressão",
      status: "pending",
    });

  beforeEach(() => {
    followUps = new InMemoryFollowUpRepository();
    audit = new FakeAuditLog();
    useCase = new DeleteFollowUpUseCase(followUps, new Authorizer(), audit);
  });

  it("remove o acompanhamento e registra auditoria", async () => {
    const followUp = makeFollowUp();
    await followUps.save(followUp);

    await useCase.execute({
      actor: professional,
      clinicId: "clinic-1",
      followUpId: followUp.id,
    });

    expect(followUps.items).toHaveLength(0);
    expect(audit.entries[0].action).toBe("follow_up.deleted");
  });

  it("falha quando o acompanhamento é de outra clínica", async () => {
    const followUp = makeFollowUp("clinic-2");
    await followUps.save(followUp);

    await expect(
      useCase.execute({
        actor: professional,
        clinicId: "clinic-1",
        followUpId: followUp.id,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(followUps.items).toHaveLength(1);
  });

  it("nega quando o ator não é membro da clínica", async () => {
    const followUp = makeFollowUp();
    await followUps.save(followUp);
    const outsider = new AuthenticatedActor({
      userId: "u2",
      platformRole: "member",
      memberships: [{ clinicId: "clinic-2", role: "owner" }],
    });

    await expect(
      useCase.execute({
        actor: outsider,
        clinicId: "clinic-1",
        followUpId: followUp.id,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(followUps.items).toHaveLength(1);
  });
});
