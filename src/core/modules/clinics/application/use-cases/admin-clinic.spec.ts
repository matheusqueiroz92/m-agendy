import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { ClinicValidationError } from "../../domain/errors";
import { InMemoryAdminClinicRepository } from "../testing/in-memory-admin-clinic-repository";
import { DeleteClinicUseCase } from "./delete-clinic";
import { SetClinicPlanOverrideUseCase } from "./set-clinic-plan-override";
import { SetClinicStatusUseCase } from "./set-clinic-status";
import { UpsertClinicUseCase } from "./upsert-clinic";

const admin = new AuthenticatedActor({
  userId: "admin",
  platformRole: "platform_admin",
  memberships: [],
});
const member = new AuthenticatedActor({
  userId: "u1",
  platformRole: "member",
  memberships: [{ clinicId: "clinic-1", role: "owner" }],
});

describe("Casos de uso de administração de clínicas", () => {
  let repo: InMemoryAdminClinicRepository;
  let audit: FakeAuditLog;

  beforeEach(() => {
    repo = new InMemoryAdminClinicRepository();
    audit = new FakeAuditLog();
  });

  it("admin cria clínica e audita", async () => {
    const useCase = new UpsertClinicUseCase(repo, new Authorizer(), audit);
    const { clinicId } = await useCase.execute({
      actor: admin,
      name: "Clínica Nova",
      type: "medical",
    });
    expect(repo.items).toHaveLength(1);
    expect(clinicId).toBeTruthy();
    expect(audit.entries[0].action).toBe("clinic.created");
  });

  it("não-admin é barrado em qualquer operação", async () => {
    const useCase = new UpsertClinicUseCase(repo, new Authorizer(), audit);
    await expect(
      useCase.execute({ actor: member, name: "X", type: "dental" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejeita nome vazio", async () => {
    const useCase = new UpsertClinicUseCase(repo, new Authorizer(), audit);
    await expect(
      useCase.execute({ actor: admin, name: "   ", type: "medical" }),
    ).rejects.toBeInstanceOf(ClinicValidationError);
  });

  it("bloquear/liberar altera status e audita", async () => {
    const { id } = await repo.create({ name: "C", type: "medical" });
    const setStatus = new SetClinicStatusUseCase(repo, new Authorizer(), audit);

    await setStatus.execute({
      actor: admin,
      clinicId: id,
      status: "blocked",
      reason: "inadimplência",
    });
    expect(repo.items[0].status).toBe("blocked");
    expect(repo.items[0].blockedReason).toBe("inadimplência");
    expect(audit.entries[0].action).toBe("clinic.blocked");

    await setStatus.execute({ actor: admin, clinicId: id, status: "active" });
    expect(repo.items[0].status).toBe("active");
    expect(repo.items[0].blockedReason).toBeNull();
  });

  it("define e remove override de plano", async () => {
    const { id } = await repo.create({ name: "C", type: "medical" });
    const setPlan = new SetClinicPlanOverrideUseCase(repo, new Authorizer(), audit);

    await setPlan.execute({ actor: admin, clinicId: id, planOverride: "premium" });
    expect(repo.items[0].planOverride).toBe("premium");

    await setPlan.execute({ actor: admin, clinicId: id, planOverride: null });
    expect(repo.items[0].planOverride).toBeNull();
    expect(repo.items[0].planOverrideExpiresAt).toBeNull();
  });

  it("exclui clínica; falha se inexistente", async () => {
    const { id } = await repo.create({ name: "C", type: "medical" });
    const del = new DeleteClinicUseCase(repo, new Authorizer(), audit);

    await del.execute({ actor: admin, clinicId: id });
    expect(repo.items).toHaveLength(0);

    await expect(
      del.execute({ actor: admin, clinicId: "inexistente" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
