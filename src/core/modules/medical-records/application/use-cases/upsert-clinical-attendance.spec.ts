import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { ClinicalAttendance } from "../../domain/clinical-attendance";
import { FakePatientAccessChecker } from "../testing/fakes";
import { InMemoryClinicalAttendanceRepository } from "../testing/in-memory-clinical-attendance-repository";
import { UpsertClinicalAttendanceUseCase } from "./upsert-clinical-attendance";

describe("UpsertClinicalAttendanceUseCase", () => {
  let attendances: InMemoryClinicalAttendanceRepository;
  let access: FakePatientAccessChecker;
  let audit: FakeAuditLog;
  let useCase: UpsertClinicalAttendanceUseCase;

  const professional = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "professional" }],
  });

  const baseInput = {
    actor: professional,
    clinicId: "clinic-1",
    patientId: "patient-1",
    date: new Date("2026-06-15T12:00:00.000Z"),
    chiefComplaint: "Dor de cabeça",
  };

  beforeEach(() => {
    attendances = new InMemoryClinicalAttendanceRepository();
    access = new FakePatientAccessChecker();
    access.allow("patient-1", "clinic-1");
    audit = new FakeAuditLog();
    useCase = new UpsertClinicalAttendanceUseCase(
      attendances,
      access,
      new Authorizer(),
      audit,
    );
  });

  it("cria um atendimento e registra auditoria", async () => {
    const result = await useCase.execute(baseInput);

    expect(attendances.items).toHaveLength(1);
    expect(result.attendanceId).toBeTruthy();
    expect(attendances.items[0].toPrimitives().chiefComplaint).toBe(
      "Dor de cabeça",
    );
    expect(audit.entries[0].action).toBe("attendance.created");
  });

  it("normaliza campos vazios para null", async () => {
    await useCase.execute({ ...baseInput, chiefComplaint: "  ", notes: "" });
    const data = attendances.items[0].toPrimitives();
    expect(data.chiefComplaint).toBeNull();
    expect(data.notes).toBeNull();
  });

  it("atualiza atendimento existente da mesma clínica", async () => {
    const existing = ClinicalAttendance.create({
      clinicId: "clinic-1",
      patientId: "patient-1",
      date: baseInput.date,
      conduct: "Repouso",
    });
    await attendances.save(existing);

    await useCase.execute({ ...baseInput, id: existing.id, conduct: "Medicar" });

    expect(attendances.items).toHaveLength(1);
    expect(attendances.items[0].toPrimitives().conduct).toBe("Medicar");
    expect(audit.entries[0].action).toBe("attendance.updated");
  });

  it("impede editar atendimento de outra clínica", async () => {
    const other = ClinicalAttendance.create({
      clinicId: "clinic-2",
      patientId: "p",
      date: baseInput.date,
    });
    await attendances.save(other);

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
});
