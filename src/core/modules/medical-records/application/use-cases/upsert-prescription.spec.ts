import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import {
  Prescription,
  PrescriptionValidationError,
} from "../../domain/prescription";
import { FakePatientAccessChecker } from "../testing/fakes";
import { InMemoryPrescriptionRepository } from "../testing/in-memory-prescription-repository";
import { UpsertPrescriptionUseCase } from "./upsert-prescription";

describe("UpsertPrescriptionUseCase", () => {
  let prescriptions: InMemoryPrescriptionRepository;
  let access: FakePatientAccessChecker;
  let audit: FakeAuditLog;
  let useCase: UpsertPrescriptionUseCase;

  const professional = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "professional" }],
  });

  const baseInput = {
    actor: professional,
    clinicId: "clinic-1",
    patientId: "patient-1",
    medication: "Amoxicilina 500mg",
    date: new Date("2026-06-15T12:00:00.000Z"),
  };

  beforeEach(() => {
    prescriptions = new InMemoryPrescriptionRepository();
    access = new FakePatientAccessChecker();
    access.allow("patient-1", "clinic-1");
    audit = new FakeAuditLog();
    useCase = new UpsertPrescriptionUseCase(
      prescriptions,
      access,
      new Authorizer(),
      audit,
    );
  });

  it("cria uma prescrição e registra auditoria", async () => {
    const result = await useCase.execute({ ...baseInput, frequency: "8/8h" });

    expect(prescriptions.items).toHaveLength(1);
    expect(result.prescriptionId).toBeTruthy();
    expect(prescriptions.items[0].toPrimitives().frequency).toBe("8/8h");
    expect(audit.entries[0].action).toBe("prescription.created");
  });

  it("atualiza prescrição existente da mesma clínica", async () => {
    const existing = Prescription.create({
      clinicId: "clinic-1",
      patientId: "patient-1",
      medication: "Amoxicilina",
      date: baseInput.date,
    });
    await prescriptions.save(existing);

    await useCase.execute({
      ...baseInput,
      id: existing.id,
      medication: "Azitromicina",
    });

    expect(prescriptions.items).toHaveLength(1);
    expect(prescriptions.items[0].toPrimitives().medication).toBe(
      "Azitromicina",
    );
    expect(audit.entries[0].action).toBe("prescription.updated");
  });

  it("impede editar prescrição de outra clínica", async () => {
    const other = Prescription.create({
      clinicId: "clinic-2",
      patientId: "p",
      medication: "X",
      date: baseInput.date,
    });
    await prescriptions.save(other);

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

  it("valida medicamento obrigatório (invariante de domínio)", async () => {
    await expect(
      useCase.execute({ ...baseInput, medication: "   " }),
    ).rejects.toBeInstanceOf(PrescriptionValidationError);
  });
});
