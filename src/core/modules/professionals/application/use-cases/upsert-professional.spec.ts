import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError, PlanLimitError } from "@/core/shared/domain/errors";

import { ProfessionalValidationError } from "../../domain/errors";
import { Professional } from "../../domain/professional";
import { InMemoryProfessionalRepository } from "../testing/in-memory-professional-repository";
import { UpsertProfessionalUseCase } from "./upsert-professional";

const weekdaysWindows = [1, 2, 3, 4, 5].map((weekDay) => ({
  weekDay,
  startTime: "08:00:00",
  endTime: "18:00:00",
}));

describe("UpsertProfessionalUseCase", () => {
  let professionals: InMemoryProfessionalRepository;
  let audit: FakeAuditLog;
  let useCase: UpsertProfessionalUseCase;

  const manager = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "owner" }],
  });

  const baseInput = {
    actor: manager,
    clinicId: "clinic-1",
    name: "Dr. House",
    speciality: "Clínico Geral",
    appointmentPriceInCents: 20000,
    defaultAppointmentDurationInMinutes: 30,
    availabilityWindows: weekdaysWindows,
  };

  beforeEach(() => {
    professionals = new InMemoryProfessionalRepository();
    audit = new FakeAuditLog();
    useCase = new UpsertProfessionalUseCase(
      professionals,
      new Authorizer(),
      audit,
    );
  });

  it("cria um profissional e registra auditoria", async () => {
    const result = await useCase.execute(baseInput);

    expect(professionals.items).toHaveLength(1);
    expect(result.professionalId).toBeTruthy();
    expect(audit.entries[0].action).toBe("professional.created");
  });

  it("bloqueia criação ao atingir o limite do plano (essential = 3)", async () => {
    for (let i = 0; i < 3; i++) {
      await professionals.save(
        Professional.create({ ...baseInput, name: `Prof ${i}` }),
      );
    }
    await expect(
      useCase.execute({ ...baseInput, plan: "essential" }),
    ).rejects.toBeInstanceOf(PlanLimitError);
  });

  it("plano gold permite criar sem limite", async () => {
    for (let i = 0; i < 20; i++) {
      await professionals.save(
        Professional.create({ ...baseInput, name: `Prof ${i}` }),
      );
    }
    const result = await useCase.execute({ ...baseInput, plan: "gold" });
    expect(result.professionalId).toBeTruthy();
  });

  it("impede editar profissional de outra clínica", async () => {
    const other = Professional.create({ ...baseInput, clinicId: "clinic-2" });
    await professionals.save(other);

    await expect(
      useCase.execute({ ...baseInput, id: other.id }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("nega quando o ator não pode gerenciar a clínica", async () => {
    const professional = new AuthenticatedActor({
      userId: "u2",
      platformRole: "member",
      memberships: [{ clinicId: "clinic-1", role: "professional" }],
    });

    await expect(
      useCase.execute({ ...baseInput, actor: professional }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("valida invariante de horário (início após término)", async () => {
    await expect(
      useCase.execute({
        ...baseInput,
        availabilityWindows: [
          { weekDay: 1, startTime: "18:00:00", endTime: "08:00:00" },
        ],
      }),
    ).rejects.toBeInstanceOf(ProfessionalValidationError);
  });

  it("valida invariante de preço (zero)", async () => {
    await expect(
      useCase.execute({ ...baseInput, appointmentPriceInCents: 0 }),
    ).rejects.toBeInstanceOf(ProfessionalValidationError);
  });
});
