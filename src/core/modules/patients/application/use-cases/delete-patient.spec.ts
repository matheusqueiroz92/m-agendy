import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { Patient } from "../../domain/patient";
import { InMemoryPatientRepository } from "../testing/in-memory-patient-repository";
import { DeletePatientUseCase } from "./delete-patient";

describe("DeletePatientUseCase", () => {
  let patients: InMemoryPatientRepository;
  let audit: FakeAuditLog;
  let useCase: DeletePatientUseCase;

  const manager = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "manager" }],
  });

  const makePatient = (clinicId = "clinic-1") =>
    Patient.create({
      clinicId,
      name: "Maria",
      email: "maria@example.com",
      phoneNumber: "11999999999",
      sex: "female",
    });

  beforeEach(() => {
    patients = new InMemoryPatientRepository();
    audit = new FakeAuditLog();
    useCase = new DeletePatientUseCase(patients, new Authorizer(), audit);
  });

  it("remove paciente da clínica e registra auditoria", async () => {
    const patient = makePatient();
    await patients.save(patient);

    await useCase.execute({
      actor: manager,
      clinicId: "clinic-1",
      patientId: patient.id,
    });

    expect(patients.items).toHaveLength(0);
    expect(audit.entries[0].action).toBe("patient.deleted");
  });

  it("falha quando o paciente é de outra clínica", async () => {
    const patient = makePatient("clinic-2");
    await patients.save(patient);

    await expect(
      useCase.execute({
        actor: manager,
        clinicId: "clinic-1",
        patientId: patient.id,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(patients.items).toHaveLength(1);
  });

  it("nega quando o ator não pode gerenciar a clínica", async () => {
    const patient = makePatient();
    await patients.save(patient);
    const staff = new AuthenticatedActor({
      userId: "u3",
      platformRole: "member",
      memberships: [{ clinicId: "clinic-1", role: "staff" }],
    });

    await expect(
      useCase.execute({
        actor: staff,
        clinicId: "clinic-1",
        patientId: patient.id,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(patients.items).toHaveLength(1);
  });
});
