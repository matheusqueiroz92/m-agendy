import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeClinicNotifier } from "@/core/modules/scheduling/application/testing/confirmation-fakes";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { ClinicValidationError } from "../../domain/errors";
import { FakeClinicOwnerProvisioner } from "../testing/fake-clinic-owner-provisioner";
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
  let owners: FakeClinicOwnerProvisioner;
  let clinicNotifier: FakeClinicNotifier;

  beforeEach(() => {
    repo = new InMemoryAdminClinicRepository();
    audit = new FakeAuditLog();
    owners = new FakeClinicOwnerProvisioner();
    clinicNotifier = new FakeClinicNotifier();
  });

  it("admin cria clínica, provisiona uma conta nova para o responsável e audita", async () => {
    const useCase = new UpsertClinicUseCase(repo, new Authorizer(), audit, owners, clinicNotifier);
    const { clinicId } = await useCase.execute({
      actor: admin,
      name: "Clínica Nova",
      type: "medical",
      ownerName: "Maria Souza",
      ownerEmail: "maria@example.com",
      ownerPhoneNumber: "+5511999999999",
    });

    expect(repo.items).toHaveLength(1);
    expect(clinicId).toBeTruthy();
    expect(audit.entries[0].action).toBe("clinic.created");
    expect(owners.provisioned).toHaveLength(1);
    expect(owners.provisioned[0]).toEqual({
      name: "Maria Souza",
      email: "maria@example.com",
      phoneNumber: "+5511999999999",
    });
    expect(repo.owners.get(clinicId)).toBeTruthy();
  });

  it("reaproveita usuário existente quando o e-mail do responsável já tem conta", async () => {
    owners.setExisting("existente@example.com", "user-existente");
    const useCase = new UpsertClinicUseCase(repo, new Authorizer(), audit, owners, clinicNotifier);

    const { clinicId } = await useCase.execute({
      actor: admin,
      name: "Clínica Reaproveitada",
      type: "medical",
      ownerName: "Alguém",
      ownerEmail: "existente@example.com",
    });

    expect(repo.owners.get(clinicId)).toBe("user-existente");
  });

  it("rejeita criação sem nome do responsável", async () => {
    const useCase = new UpsertClinicUseCase(repo, new Authorizer(), audit, owners, clinicNotifier);
    await expect(
      useCase.execute({
        actor: admin,
        name: "Clínica X",
        type: "medical",
        ownerEmail: "x@example.com",
      }),
    ).rejects.toBeInstanceOf(ClinicValidationError);
    expect(repo.items).toHaveLength(0);
  });

  it("rejeita criação sem e-mail do responsável", async () => {
    const useCase = new UpsertClinicUseCase(repo, new Authorizer(), audit, owners, clinicNotifier);
    await expect(
      useCase.execute({
        actor: admin,
        name: "Clínica X",
        type: "medical",
        ownerName: "Alguém",
      }),
    ).rejects.toBeInstanceOf(ClinicValidationError);
    expect(repo.items).toHaveLength(0);
  });

  it("não exige responsável ao editar uma clínica existente", async () => {
    const { id } = await repo.create({ name: "C", type: "medical" });
    const useCase = new UpsertClinicUseCase(repo, new Authorizer(), audit, owners, clinicNotifier);

    await useCase.execute({
      actor: admin,
      id,
      name: "C Editada",
      type: "dental",
    });

    expect(repo.items[0].name).toBe("C Editada");
    expect(owners.provisioned).toHaveLength(0);
  });

  it("avisa a clínica sobre o número compartilhado ao criar, mas não ao editar", async () => {
    const useCase = new UpsertClinicUseCase(
      repo,
      new Authorizer(),
      audit,
      owners,
      clinicNotifier,
    );

    const { clinicId } = await useCase.execute({
      actor: admin,
      name: "Clínica Nova",
      type: "medical",
      ownerName: "Maria Souza",
      ownerEmail: "maria2@example.com",
    });
    expect(clinicNotifier.sharedNumberDisclosures).toEqual([
      { clinicId },
    ]);

    await useCase.execute({
      actor: admin,
      id: clinicId,
      name: "Clínica Editada",
      type: "medical",
    });
    expect(clinicNotifier.sharedNumberDisclosures).toHaveLength(1);
  });

  it("reverte a clínica criada se o provisionamento do responsável falhar", async () => {
    owners.failNext();
    const useCase = new UpsertClinicUseCase(repo, new Authorizer(), audit, owners, clinicNotifier);

    await expect(
      useCase.execute({
        actor: admin,
        name: "Clínica Falha",
        type: "medical",
        ownerName: "Alguém",
        ownerEmail: "falha@example.com",
      }),
    ).rejects.toThrow();

    expect(repo.items).toHaveLength(0);
  });

  it("não-admin é barrado em qualquer operação", async () => {
    const useCase = new UpsertClinicUseCase(repo, new Authorizer(), audit, owners, clinicNotifier);
    await expect(
      useCase.execute({ actor: member, name: "X", type: "dental" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejeita nome vazio", async () => {
    const useCase = new UpsertClinicUseCase(repo, new Authorizer(), audit, owners, clinicNotifier);
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
