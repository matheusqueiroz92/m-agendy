import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { Diagnosis, DiagnosisValidationError } from "../../domain/diagnosis";
import { FakePatientAccessChecker } from "../testing/fakes";
import { InMemoryDiagnosisRepository } from "../testing/in-memory-diagnosis-repository";
import { UpsertDiagnosisUseCase } from "./upsert-diagnosis";

describe("UpsertDiagnosisUseCase", () => {
  let diagnoses: InMemoryDiagnosisRepository;
  let access: FakePatientAccessChecker;
  let audit: FakeAuditLog;
  let useCase: UpsertDiagnosisUseCase;

  const professional = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "professional" }],
  });

  const baseInput = {
    actor: professional,
    clinicId: "clinic-1",
    patientId: "patient-1",
    description: "Hipertensão",
    status: "active" as const,
    date: new Date("2026-06-15T12:00:00.000Z"),
  };

  beforeEach(() => {
    diagnoses = new InMemoryDiagnosisRepository();
    access = new FakePatientAccessChecker();
    access.allow("patient-1", "clinic-1");
    audit = new FakeAuditLog();
    useCase = new UpsertDiagnosisUseCase(
      diagnoses,
      access,
      new Authorizer(),
      audit,
    );
  });

  it("cria um diagnóstico e registra auditoria", async () => {
    const result = await useCase.execute(baseInput);

    expect(diagnoses.items).toHaveLength(1);
    expect(result.diagnosisId).toBeTruthy();
    expect(audit.entries[0].action).toBe("diagnosis.created");
  });

  it("atualiza diagnóstico existente da mesma clínica", async () => {
    const existing = Diagnosis.create({
      clinicId: "clinic-1",
      patientId: "patient-1",
      description: "Hipertensão",
      status: "active",
      date: baseInput.date,
    });
    await diagnoses.save(existing);

    await useCase.execute({
      ...baseInput,
      id: existing.id,
      status: "chronic",
    });

    expect(diagnoses.items).toHaveLength(1);
    expect(diagnoses.items[0].toPrimitives().status).toBe("chronic");
    expect(audit.entries[0].action).toBe("diagnosis.updated");
  });

  it("impede editar diagnóstico de outra clínica", async () => {
    const other = Diagnosis.create({
      clinicId: "clinic-2",
      patientId: "p",
      description: "X",
      status: "active",
      date: baseInput.date,
    });
    await diagnoses.save(other);

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

  it("valida descrição obrigatória (invariante de domínio)", async () => {
    await expect(
      useCase.execute({ ...baseInput, description: "   " }),
    ).rejects.toBeInstanceOf(DiagnosisValidationError);
  });
});
