import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { FollowUp, FollowUpValidationError } from "../../domain/follow-up";
import { FakePatientAccessChecker } from "../testing/fakes";
import { InMemoryFollowUpRepository } from "../testing/in-memory-follow-up-repository";
import { UpsertFollowUpUseCase } from "./upsert-follow-up";

describe("UpsertFollowUpUseCase", () => {
  let followUps: InMemoryFollowUpRepository;
  let access: FakePatientAccessChecker;
  let audit: FakeAuditLog;
  let useCase: UpsertFollowUpUseCase;

  const professional = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "professional" }],
  });

  const baseInput = {
    actor: professional,
    clinicId: "clinic-1",
    patientId: "patient-1",
    title: "Controle de pressão",
    status: "pending" as const,
  };

  beforeEach(() => {
    followUps = new InMemoryFollowUpRepository();
    access = new FakePatientAccessChecker();
    access.allow("patient-1", "clinic-1");
    audit = new FakeAuditLog();
    useCase = new UpsertFollowUpUseCase(
      followUps,
      access,
      new Authorizer(),
      audit,
    );
  });

  it("cria um acompanhamento e registra auditoria", async () => {
    const result = await useCase.execute(baseInput);

    expect(followUps.items).toHaveLength(1);
    expect(result.followUpId).toBeTruthy();
    expect(audit.entries[0].action).toBe("follow_up.created");
  });

  it("atualiza acompanhamento existente da mesma clínica", async () => {
    const existing = FollowUp.create({
      clinicId: "clinic-1",
      patientId: "patient-1",
      title: "Controle de pressão",
      status: "pending",
    });
    await followUps.save(existing);

    await useCase.execute({
      ...baseInput,
      id: existing.id,
      status: "completed",
    });

    expect(followUps.items).toHaveLength(1);
    expect(followUps.items[0].toPrimitives().status).toBe("completed");
    expect(audit.entries[0].action).toBe("follow_up.updated");
  });

  it("impede editar acompanhamento de outra clínica", async () => {
    const other = FollowUp.create({
      clinicId: "clinic-2",
      patientId: "p",
      title: "X",
      status: "pending",
    });
    await followUps.save(other);

    await expect(
      useCase.execute({ ...baseInput, id: other.id }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("impede criar para paciente de outra clínica", async () => {
    await expect(
      useCase.execute({ ...baseInput, patientId: "patient-de-outra" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("nega quando o ator não é membro da clínica", async () => {
    const outsider = new AuthenticatedActor({
      userId: "u2",
      platformRole: "member",
      memberships: [{ clinicId: "clinic-2", role: "owner" }],
    });

    await expect(
      useCase.execute({ ...baseInput, actor: outsider }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("valida título obrigatório (invariante de domínio)", async () => {
    await expect(
      useCase.execute({ ...baseInput, title: "   " }),
    ).rejects.toBeInstanceOf(FollowUpValidationError);
  });
});
