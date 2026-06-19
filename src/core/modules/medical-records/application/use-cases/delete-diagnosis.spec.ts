import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { Diagnosis } from "../../domain/diagnosis";
import { InMemoryDiagnosisRepository } from "../testing/in-memory-diagnosis-repository";
import { DeleteDiagnosisUseCase } from "./delete-diagnosis";

describe("DeleteDiagnosisUseCase", () => {
  let diagnoses: InMemoryDiagnosisRepository;
  let audit: FakeAuditLog;
  let useCase: DeleteDiagnosisUseCase;

  const professional = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "professional" }],
  });

  const makeDiagnosis = (clinicId = "clinic-1") =>
    Diagnosis.create({
      clinicId,
      patientId: "patient-1",
      description: "Hipertensão",
      status: "active",
      date: new Date("2026-06-15T12:00:00.000Z"),
    });

  beforeEach(() => {
    diagnoses = new InMemoryDiagnosisRepository();
    audit = new FakeAuditLog();
    useCase = new DeleteDiagnosisUseCase(diagnoses, new Authorizer(), audit);
  });

  it("remove o diagnóstico e registra auditoria", async () => {
    const diagnosis = makeDiagnosis();
    await diagnoses.save(diagnosis);

    await useCase.execute({
      actor: professional,
      clinicId: "clinic-1",
      diagnosisId: diagnosis.id,
    });

    expect(diagnoses.items).toHaveLength(0);
    expect(audit.entries[0].action).toBe("diagnosis.deleted");
  });

  it("falha quando o diagnóstico é de outra clínica", async () => {
    const diagnosis = makeDiagnosis("clinic-2");
    await diagnoses.save(diagnosis);

    await expect(
      useCase.execute({
        actor: professional,
        clinicId: "clinic-1",
        diagnosisId: diagnosis.id,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(diagnoses.items).toHaveLength(1);
  });

  it("nega quando o ator não é membro da clínica", async () => {
    const diagnosis = makeDiagnosis();
    await diagnoses.save(diagnosis);
    const outsider = new AuthenticatedActor({
      userId: "u2",
      platformRole: "member",
      memberships: [{ clinicId: "clinic-2", role: "owner" }],
    });

    await expect(
      useCase.execute({
        actor: outsider,
        clinicId: "clinic-1",
        diagnosisId: diagnosis.id,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(diagnoses.items).toHaveLength(1);
  });
});
