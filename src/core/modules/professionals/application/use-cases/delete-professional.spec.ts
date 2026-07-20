import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { Professional } from "../../domain/professional";
import { InMemoryProfessionalRepository } from "../testing/in-memory-professional-repository";
import { DeleteProfessionalUseCase } from "./delete-professional";

describe("DeleteProfessionalUseCase", () => {
  let professionals: InMemoryProfessionalRepository;
  let audit: FakeAuditLog;
  let useCase: DeleteProfessionalUseCase;

  const manager = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "manager" }],
  });

  const makeProfessional = (clinicId = "clinic-1") =>
    Professional.create({
      clinicId,
      name: "Dr. House",
      speciality: "Clínico Geral",
      appointmentPriceInCents: 20000,
      defaultAppointmentDurationInMinutes: 30,
      availabilityWindows: [1, 2, 3, 4, 5].map((weekDay) => ({
        weekDay,
        startTime: "08:00:00",
        endTime: "18:00:00",
      })),
    });

  beforeEach(() => {
    professionals = new InMemoryProfessionalRepository();
    audit = new FakeAuditLog();
    useCase = new DeleteProfessionalUseCase(
      professionals,
      new Authorizer(),
      audit,
    );
  });

  it("remove profissional da clínica e registra auditoria", async () => {
    const professional = makeProfessional();
    await professionals.save(professional);

    await useCase.execute({
      actor: manager,
      clinicId: "clinic-1",
      professionalId: professional.id,
    });

    expect(professionals.items).toHaveLength(0);
    expect(audit.entries[0].action).toBe("professional.deleted");
  });

  it("falha quando o profissional é de outra clínica", async () => {
    const professional = makeProfessional("clinic-2");
    await professionals.save(professional);

    await expect(
      useCase.execute({
        actor: manager,
        clinicId: "clinic-1",
        professionalId: professional.id,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(professionals.items).toHaveLength(1);
  });

  it("nega quando o ator não pode gerenciar a clínica", async () => {
    const professional = makeProfessional();
    await professionals.save(professional);
    const staff = new AuthenticatedActor({
      userId: "u3",
      platformRole: "member",
      memberships: [{ clinicId: "clinic-1", role: "staff" }],
    });

    await expect(
      useCase.execute({
        actor: staff,
        clinicId: "clinic-1",
        professionalId: professional.id,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(professionals.items).toHaveLength(1);
  });
});
