import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import {
  FakeClinicNotifier,
} from "@/core/modules/scheduling/application/testing/confirmation-fakes";
import {
  FakeClinicPlanProvider,
  FakeClinicWhatsAppDirectory,
} from "@/core/modules/scheduling/application/testing/fakes";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { ClinicValidationError } from "../../domain/errors";
import { InMemoryWhatsAppIntegrationRequestRepository } from "../testing/in-memory-whatsapp-integration-request-repository";
import { CompleteWhatsAppIntegrationRequestUseCase } from "./complete-whatsapp-integration-request";
import { ListWhatsAppIntegrationRequestsUseCase } from "./list-whatsapp-integration-requests";
import { RequestWhatsAppIntegrationUseCase } from "./request-whatsapp-integration";

const admin = new AuthenticatedActor({
  userId: "admin",
  platformRole: "platform_admin",
  memberships: [],
});
const owner = new AuthenticatedActor({
  userId: "u1",
  platformRole: "member",
  memberships: [{ clinicId: "clinic-1", role: "owner" }],
});
const staff = new AuthenticatedActor({
  userId: "u2",
  platformRole: "member",
  memberships: [{ clinicId: "clinic-1", role: "staff" }],
});

describe("RequestWhatsAppIntegrationUseCase", () => {
  let requests: InMemoryWhatsAppIntegrationRequestRepository;
  let whatsapp: FakeClinicWhatsAppDirectory;

  beforeEach(() => {
    requests = new InMemoryWhatsAppIntegrationRequestRepository();
    whatsapp = new FakeClinicWhatsAppDirectory();
  });

  const makeUseCase = (plan: string | null) =>
    new RequestWhatsAppIntegrationUseCase(
      requests,
      whatsapp,
      new FakeClinicPlanProvider(plan),
      new Authorizer(),
    );

  it("clínica premium solicita a integração com sucesso", async () => {
    const useCase = makeUseCase("premium");
    const { requestId } = await useCase.execute({
      actor: owner,
      clinicId: "clinic-1",
    });

    expect(requestId).toBeTruthy();
    const saved = await requests.findPendingByClinic("clinic-1");
    expect(saved?.status).toBe("pending");
  });

  it("recusa clínica essential (plano não libera número próprio)", async () => {
    const useCase = makeUseCase("essential");
    await expect(
      useCase.execute({ actor: owner, clinicId: "clinic-1" }),
    ).rejects.toThrow(/plano/i);
  });

  it("recusa clínica sem plano ativo", async () => {
    const useCase = makeUseCase(null);
    await expect(
      useCase.execute({ actor: owner, clinicId: "clinic-1" }),
    ).rejects.toThrow(/plano/i);
  });

  it("recusa quem não pode gerir a clínica (staff)", async () => {
    const useCase = makeUseCase("premium");
    await expect(
      useCase.execute({ actor: staff, clinicId: "clinic-1" }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("recusa se a clínica já tem número próprio integrado", async () => {
    whatsapp.set("clinic-1", "123456");
    const useCase = makeUseCase("premium");
    await expect(
      useCase.execute({ actor: owner, clinicId: "clinic-1" }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("recusa segunda solicitação enquanto a primeira está pendente", async () => {
    const useCase = makeUseCase("premium");
    await useCase.execute({ actor: owner, clinicId: "clinic-1" });

    await expect(
      useCase.execute({ actor: owner, clinicId: "clinic-1" }),
    ).rejects.toThrow(ForbiddenError);
  });
});

describe("ListWhatsAppIntegrationRequestsUseCase", () => {
  it("admin lista todas as solicitações", async () => {
    const requests = new InMemoryWhatsAppIntegrationRequestRepository();
    requests.clinicInfo.set("clinic-1", {
      name: "Clínica A",
      plan: "premium",
      ownerPhoneNumber: "5511999998888",
    });
    const created = await new RequestWhatsAppIntegrationUseCase(
      requests,
      new FakeClinicWhatsAppDirectory(),
      new FakeClinicPlanProvider("premium"),
      new Authorizer(),
    ).execute({ actor: owner, clinicId: "clinic-1" });

    const useCase = new ListWhatsAppIntegrationRequestsUseCase(
      requests,
      new Authorizer(),
    );
    const list = await useCase.execute({ actor: admin });

    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: created.requestId,
      clinicName: "Clínica A",
      clinicPlan: "premium",
      ownerPhoneNumber: "5511999998888",
      status: "pending",
    });
  });

  it("recusa quem não é admin de plataforma", async () => {
    const useCase = new ListWhatsAppIntegrationRequestsUseCase(
      new InMemoryWhatsAppIntegrationRequestRepository(),
      new Authorizer(),
    );
    await expect(useCase.execute({ actor: owner })).rejects.toThrow(
      ForbiddenError,
    );
  });
});

describe("CompleteWhatsAppIntegrationRequestUseCase", () => {
  let requests: InMemoryWhatsAppIntegrationRequestRepository;
  let whatsapp: FakeClinicWhatsAppDirectory;
  let clinicNotifier: FakeClinicNotifier;
  let useCase: CompleteWhatsAppIntegrationRequestUseCase;

  beforeEach(() => {
    requests = new InMemoryWhatsAppIntegrationRequestRepository();
    whatsapp = new FakeClinicWhatsAppDirectory();
    clinicNotifier = new FakeClinicNotifier();
    useCase = new CompleteWhatsAppIntegrationRequestUseCase(
      requests,
      whatsapp,
      clinicNotifier,
      new Authorizer(),
    );
  });

  const createPendingRequest = async () => {
    const { requestId } = await new RequestWhatsAppIntegrationUseCase(
      requests,
      whatsapp,
      new FakeClinicPlanProvider("premium"),
      new Authorizer(),
    ).execute({ actor: owner, clinicId: "clinic-1" });
    return requestId;
  };

  it("admin conclui a solicitação, gravando o número e avisando a clínica", async () => {
    const requestId = await createPendingRequest();

    await useCase.execute({
      actor: admin,
      requestId,
      phoneNumberId: "999888777",
    });

    const saved = await requests.findById(requestId);
    expect(saved?.status).toBe("completed");
    expect(saved?.phoneNumberId).toBe("999888777");
    expect(await whatsapp.getPhoneNumberId("clinic-1")).toBe("999888777");
    expect(clinicNotifier.integrationCompletions).toEqual([
      { clinicId: "clinic-1", phoneNumberId: "999888777" },
    ]);
  });

  it("recusa quem não é admin de plataforma", async () => {
    const requestId = await createPendingRequest();
    await expect(
      useCase.execute({ actor: owner, requestId, phoneNumberId: "999" }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("recusa solicitação inexistente", async () => {
    await expect(
      useCase.execute({
        actor: admin,
        requestId: "não-existe",
        phoneNumberId: "999",
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("recusa concluir sem phone_number_id", async () => {
    const requestId = await createPendingRequest();
    await expect(
      useCase.execute({ actor: admin, requestId, phoneNumberId: "" }),
    ).rejects.toThrow(ClinicValidationError);
  });

  it("recusa concluir uma solicitação já concluída", async () => {
    const requestId = await createPendingRequest();
    await useCase.execute({ actor: admin, requestId, phoneNumberId: "111" });

    await expect(
      useCase.execute({ actor: admin, requestId, phoneNumberId: "222" }),
    ).rejects.toThrow(ForbiddenError);
  });
});
