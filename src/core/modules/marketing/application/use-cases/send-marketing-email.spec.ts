import { describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { ForbiddenError } from "@/core/shared/domain/errors";

import { MarketingValidationError } from "../../domain/errors";
import {
  FakeMarketingEmailGateway,
  InMemoryMarketingAudience,
} from "../testing/fakes";
import { SendMarketingEmailUseCase } from "./send-marketing-email";

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

describe("SendMarketingEmailUseCase", () => {
  const recipients = [
    { email: "a@clinica.com", name: "Clínica A" },
    { email: "b@clinica.com", name: "Clínica B" },
  ];

  const makeUseCase = (recipientList = recipients) =>
    new SendMarketingEmailUseCase(
      new InMemoryMarketingAudience(recipientList),
      new FakeMarketingEmailGateway(),
      new Authorizer(),
    );

  it("envia para todos os destinatários com opt-in e conta os enviados", async () => {
    const gateway = new FakeMarketingEmailGateway();
    const useCase = new SendMarketingEmailUseCase(
      new InMemoryMarketingAudience(recipients),
      gateway,
      new Authorizer(),
    );

    const result = await useCase.execute({
      actor: admin,
      subject: "Novidades no M.Agendy",
      body: "Confira as novidades deste mês.",
    });

    expect(result).toEqual({ sentCount: 2, failedCount: 0 });
    expect(gateway.sent).toHaveLength(2);
    expect(gateway.sent[0].message.subject).toBe("Novidades no M.Agendy");
  });

  it("conta falhas isoladas sem derrubar o disparo inteiro", async () => {
    const gateway = new FakeMarketingEmailGateway();
    gateway.failFor = ["a@clinica.com"];
    const useCase = new SendMarketingEmailUseCase(
      new InMemoryMarketingAudience(recipients),
      gateway,
      new Authorizer(),
    );

    const result = await useCase.execute({
      actor: admin,
      subject: "Assunto",
      body: "Corpo",
    });

    expect(result).toEqual({ sentCount: 1, failedCount: 1 });
  });

  it("recusa assunto vazio", async () => {
    const useCase = makeUseCase();
    await expect(
      useCase.execute({ actor: admin, subject: "  ", body: "Corpo" }),
    ).rejects.toBeInstanceOf(MarketingValidationError);
  });

  it("recusa corpo vazio", async () => {
    const useCase = makeUseCase();
    await expect(
      useCase.execute({ actor: admin, subject: "Assunto", body: "" }),
    ).rejects.toBeInstanceOf(MarketingValidationError);
  });

  it("recusa quem não é admin de plataforma", async () => {
    const useCase = makeUseCase();
    await expect(
      useCase.execute({ actor: owner, subject: "Assunto", body: "Corpo" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("não envia nada quando não há ninguém com opt-in", async () => {
    const useCase = makeUseCase([]);
    const result = await useCase.execute({
      actor: admin,
      subject: "Assunto",
      body: "Corpo",
    });
    expect(result).toEqual({ sentCount: 0, failedCount: 0 });
  });
});
