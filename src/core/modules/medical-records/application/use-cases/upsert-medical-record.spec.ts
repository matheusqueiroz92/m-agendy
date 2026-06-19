import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import {
  FakePatientAccessChecker,
  InMemoryMedicalRecordRepository,
} from "../testing/fakes";
import { UpsertMedicalRecordUseCase } from "./upsert-medical-record";

describe("UpsertMedicalRecordUseCase", () => {
  let records: InMemoryMedicalRecordRepository;
  let access: FakePatientAccessChecker;
  let audit: FakeAuditLog;
  let useCase: UpsertMedicalRecordUseCase;

  // Profissional é membro da clínica (não precisa ser gestor).
  const professional = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "professional" }],
  });

  const baseInput = {
    actor: professional,
    clinicId: "clinic-1",
    patientId: "patient-1",
    allergies: "Penicilina",
    bloodType: "O+",
  };

  beforeEach(() => {
    records = new InMemoryMedicalRecordRepository();
    access = new FakePatientAccessChecker();
    access.allow("patient-1", "clinic-1");
    audit = new FakeAuditLog();
    useCase = new UpsertMedicalRecordUseCase(
      records,
      access,
      new Authorizer(),
      audit,
    );
  });

  it("salva os antecedentes e registra auditoria", async () => {
    await useCase.execute(baseInput);

    expect(records.items).toHaveLength(1);
    expect(records.items[0].toPrimitives().allergies).toBe("Penicilina");
    expect(records.items[0].toPrimitives().bloodType).toBe("O+");
    expect(audit.entries[0].action).toBe("medical_record.updated");
    expect(audit.entries[0].entityId).toBe("patient-1");
  });

  it("normaliza campos vazios para null", async () => {
    await useCase.execute({ ...baseInput, allergies: "   ", bloodType: "" });
    const data = records.items[0].toPrimitives();
    expect(data.allergies).toBeNull();
    expect(data.bloodType).toBeNull();
  });

  it("faz upsert (sobrescreve o registro do mesmo paciente)", async () => {
    await useCase.execute(baseInput);
    await useCase.execute({ ...baseInput, allergies: "Dipirona" });

    expect(records.items).toHaveLength(1);
    expect(records.items[0].toPrimitives().allergies).toBe("Dipirona");
  });

  it("impede paciente de outra clínica (tenant-safe)", async () => {
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
});
