import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { ForbiddenError } from "@/core/shared/domain/errors";

import { Patient } from "../../domain/patient";
import { InMemoryPatientRepository } from "../testing/in-memory-patient-repository";
import { SearchPatientsUseCase } from "./search-patients";

describe("SearchPatientsUseCase", () => {
  let patients: InMemoryPatientRepository;
  let useCase: SearchPatientsUseCase;

  const manager = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "manager" }],
  });

  beforeEach(() => {
    patients = new InMemoryPatientRepository();
    useCase = new SearchPatientsUseCase(patients, new Authorizer());
  });

  const seed = async () => {
    await patients.save(
      Patient.create({
        clinicId: "clinic-1",
        name: "Ana Costa",
        email: "ana@example.com",
        phoneNumber: "11911111111",
        sex: "female",
      }),
    );
    await patients.save(
      Patient.create({
        clinicId: "clinic-1",
        name: "Bruno Lima",
        email: "bruno@example.com",
        phoneNumber: "11922222222",
        sex: "male",
      }),
    );
    await patients.save(
      Patient.create({
        clinicId: "clinic-2",
        name: "Ana Outra",
        email: "outra@example.com",
        phoneNumber: "11933333333",
        sex: "female",
      }),
    );
  };

  it("retorna lista limitada da clínica quando a query é vazia", async () => {
    await seed();
    const result = await useCase.execute({
      actor: manager,
      clinicId: "clinic-1",
      query: "",
      limit: 20,
    });
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.name)).toEqual(["Ana Costa", "Bruno Lima"]);
  });

  it("filtra por nome parcial case-insensitive", async () => {
    await seed();
    const result = await useCase.execute({
      actor: manager,
      clinicId: "clinic-1",
      query: "bru",
      limit: 20,
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Bruno Lima");
  });

  it("não retorna pacientes de outra clínica", async () => {
    await seed();
    const result = await useCase.execute({
      actor: manager,
      clinicId: "clinic-1",
      query: "Ana",
      limit: 20,
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Ana Costa");
  });

  it("nega quando o ator não pode gerenciar a clínica", async () => {
    const professional = new AuthenticatedActor({
      userId: "u2",
      platformRole: "member",
      memberships: [{ clinicId: "clinic-1", role: "professional" }],
    });
    await expect(
      useCase.execute({
        actor: professional,
        clinicId: "clinic-1",
        query: "",
        limit: 20,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
