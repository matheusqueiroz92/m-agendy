import { describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { ClinicRole } from "@/core/modules/iam/domain/roles";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { FakePatientAccessChecker } from "../testing/fakes";
import { LogMedicalRecordAccessUseCase } from "./log-medical-record-access";

const actor = (role: ClinicRole) =>
  new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role }],
  });

describe("LogMedicalRecordAccessUseCase", () => {
  const build = () => {
    const access = new FakePatientAccessChecker();
    access.allow("patient-1", "clinic-1");
    const audit = new FakeAuditLog();
    const useCase = new LogMedicalRecordAccessUseCase(
      access,
      new Authorizer(),
      audit,
    );
    return { useCase, audit };
  };

  it("audita o acesso de um profissional", async () => {
    const { useCase, audit } = build();
    await useCase.execute({
      actor: actor("professional"),
      clinicId: "clinic-1",
      patientId: "patient-1",
    });
    expect(audit.entries[0].action).toBe("medical_record.viewed");
    expect(audit.entries[0].entityId).toBe("patient-1");
  });

  it("barra a recepção (staff)", async () => {
    const { useCase, audit } = build();
    await expect(
      useCase.execute({
        actor: actor("staff"),
        clinicId: "clinic-1",
        patientId: "patient-1",
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(audit.entries).toHaveLength(0);
  });

  it("falha quando o paciente não é da clínica", async () => {
    const { useCase } = build();
    await expect(
      useCase.execute({
        actor: actor("owner"),
        clinicId: "clinic-1",
        patientId: "paciente-de-fora",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
