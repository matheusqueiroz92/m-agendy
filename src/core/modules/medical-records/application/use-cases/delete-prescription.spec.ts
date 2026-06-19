import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { Prescription } from "../../domain/prescription";
import { InMemoryPrescriptionRepository } from "../testing/in-memory-prescription-repository";
import { DeletePrescriptionUseCase } from "./delete-prescription";

describe("DeletePrescriptionUseCase", () => {
  let prescriptions: InMemoryPrescriptionRepository;
  let audit: FakeAuditLog;
  let useCase: DeletePrescriptionUseCase;

  const professional = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "professional" }],
  });

  const makePrescription = (clinicId = "clinic-1") =>
    Prescription.create({
      clinicId,
      patientId: "patient-1",
      medication: "Amoxicilina",
      date: new Date("2026-06-15T12:00:00.000Z"),
    });

  beforeEach(() => {
    prescriptions = new InMemoryPrescriptionRepository();
    audit = new FakeAuditLog();
    useCase = new DeletePrescriptionUseCase(
      prescriptions,
      new Authorizer(),
      audit,
    );
  });

  it("remove a prescrição e registra auditoria", async () => {
    const prescription = makePrescription();
    await prescriptions.save(prescription);

    await useCase.execute({
      actor: professional,
      clinicId: "clinic-1",
      prescriptionId: prescription.id,
    });

    expect(prescriptions.items).toHaveLength(0);
    expect(audit.entries[0].action).toBe("prescription.deleted");
  });

  it("falha quando a prescrição é de outra clínica", async () => {
    const prescription = makePrescription("clinic-2");
    await prescriptions.save(prescription);

    await expect(
      useCase.execute({
        actor: professional,
        clinicId: "clinic-1",
        prescriptionId: prescription.id,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(prescriptions.items).toHaveLength(1);
  });

  it("nega quando o ator não é membro da clínica", async () => {
    const prescription = makePrescription();
    await prescriptions.save(prescription);
    const outsider = new AuthenticatedActor({
      userId: "u2",
      platformRole: "member",
      memberships: [{ clinicId: "clinic-2", role: "owner" }],
    });

    await expect(
      useCase.execute({
        actor: outsider,
        clinicId: "clinic-1",
        prescriptionId: prescription.id,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(prescriptions.items).toHaveLength(1);
  });
});
