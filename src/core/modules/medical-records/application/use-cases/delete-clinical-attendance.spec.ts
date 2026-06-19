import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { ClinicalAttendance } from "../../domain/clinical-attendance";
import { InMemoryClinicalAttendanceRepository } from "../testing/in-memory-clinical-attendance-repository";
import { DeleteClinicalAttendanceUseCase } from "./delete-clinical-attendance";

describe("DeleteClinicalAttendanceUseCase", () => {
  let attendances: InMemoryClinicalAttendanceRepository;
  let audit: FakeAuditLog;
  let useCase: DeleteClinicalAttendanceUseCase;

  const professional = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "professional" }],
  });

  const makeAttendance = (clinicId = "clinic-1") =>
    ClinicalAttendance.create({
      clinicId,
      patientId: "patient-1",
      date: new Date("2026-06-15T12:00:00.000Z"),
    });

  beforeEach(() => {
    attendances = new InMemoryClinicalAttendanceRepository();
    audit = new FakeAuditLog();
    useCase = new DeleteClinicalAttendanceUseCase(
      attendances,
      new Authorizer(),
      audit,
    );
  });

  it("remove o atendimento e registra auditoria", async () => {
    const attendance = makeAttendance();
    await attendances.save(attendance);

    await useCase.execute({
      actor: professional,
      clinicId: "clinic-1",
      attendanceId: attendance.id,
    });

    expect(attendances.items).toHaveLength(0);
    expect(audit.entries[0].action).toBe("attendance.deleted");
  });

  it("falha quando o atendimento é de outra clínica", async () => {
    const attendance = makeAttendance("clinic-2");
    await attendances.save(attendance);

    await expect(
      useCase.execute({
        actor: professional,
        clinicId: "clinic-1",
        attendanceId: attendance.id,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(attendances.items).toHaveLength(1);
  });

  it("nega quando o ator não é membro da clínica", async () => {
    const attendance = makeAttendance();
    await attendances.save(attendance);
    const outsider = new AuthenticatedActor({
      userId: "u2",
      platformRole: "member",
      memberships: [{ clinicId: "clinic-2", role: "owner" }],
    });

    await expect(
      useCase.execute({
        actor: outsider,
        clinicId: "clinic-1",
        attendanceId: attendance.id,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(attendances.items).toHaveLength(1);
  });
});
