import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { PatientValidationError } from "../../domain/errors";
import { Patient } from "../../domain/patient";
import { InMemoryPatientRepository } from "../testing/in-memory-patient-repository";
import { UpsertPatientUseCase } from "./upsert-patient";

describe("UpsertPatientUseCase", () => {
  let patients: InMemoryPatientRepository;
  let audit: FakeAuditLog;
  let useCase: UpsertPatientUseCase;

  const manager = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "manager" }],
  });

  const baseInput = {
    actor: manager,
    clinicId: "clinic-1",
    name: "Maria Silva",
    email: "maria@example.com",
    phoneNumber: "11999999999",
    sex: "female" as const,
  };

  beforeEach(() => {
    patients = new InMemoryPatientRepository();
    audit = new FakeAuditLog();
    useCase = new UpsertPatientUseCase(patients, new Authorizer(), audit);
  });

  it("cria um paciente e registra auditoria", async () => {
    const result = await useCase.execute(baseInput);

    expect(patients.items).toHaveLength(1);
    expect(result.patientId).toBeTruthy();
    expect(audit.entries[0].action).toBe("patient.created");
    expect(audit.entries[0].clinicId).toBe("clinic-1");
  });

  it("atualiza paciente existente da mesma clínica", async () => {
    const existing = Patient.create({ ...baseInput, id: undefined });
    await patients.save(existing);

    await useCase.execute({
      ...baseInput,
      id: existing.id,
      name: "Maria Souza",
    });

    expect(patients.items).toHaveLength(1);
    expect(patients.items[0].toPrimitives().name).toBe("Maria Souza");
    expect(audit.entries[0].action).toBe("patient.updated");
  });

  it("impede editar paciente de outra clínica (tenant-safe)", async () => {
    const other = Patient.create({ ...baseInput, clinicId: "clinic-2" });
    await patients.save(other);

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
    expect(patients.items).toHaveLength(0);
  });

  it("valida invariantes de domínio (e-mail inválido)", async () => {
    await expect(
      useCase.execute({ ...baseInput, email: "invalido" }),
    ).rejects.toBeInstanceOf(PatientValidationError);
  });
});
