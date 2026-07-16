import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { DrizzlePatientAccessChecker } from "@/core/modules/medical-records/infra/persistence/drizzle-patient-access";
import { DrizzleClinicalAttendanceRepository } from "@/core/modules/medical-records/infra/persistence/drizzle-clinical-attendance-repository";
import { DrizzleAuditLog } from "@/core/shared/infra/drizzle-audit-log";
import { resetTestDatabase } from "@/core/shared/infra/testing/reset-test-database";
import {
  seedClinicWithOwnerAndDoctor,
  seedPatient,
} from "@/core/shared/infra/testing/seed-test-data";
import { NotFoundError } from "@/core/shared/domain/errors";

import { ClinicalAttendance } from "../../domain/clinical-attendance";
import { UpsertClinicalAttendanceUseCase } from "./upsert-clinical-attendance";

/**
 * Teste de integração "fatia completa": caso de uso real + adapters Drizzle
 * reais (não fakes), contra Postgres de verdade — exatamente a composição
 * usada em produção (`make-clinical-attendance-use-cases.ts`). Os testes
 * unitários (`upsert-clinical-attendance.spec.ts`) já provam a regra com
 * fakes; este prova que a regra continua valendo quando as queries são de
 * verdade (é dado de saúde, o isolamento por clínica é a garantia de
 * segurança mais importante do app).
 */
describe("UpsertClinicalAttendanceUseCase + Drizzle (integração)", () => {
  const useCase = new UpsertClinicalAttendanceUseCase(
    new DrizzleClinicalAttendanceRepository(),
    new DrizzlePatientAccessChecker(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );

  beforeEach(async () => {
    await resetTestDatabase();
  });

  it("cria um atendimento para paciente da própria clínica", async () => {
    const { clinic, owner } = await seedClinicWithOwnerAndDoctor();
    const patient = await seedPatient(clinic.id);
    const actor = new AuthenticatedActor({
      userId: owner.id,
      platformRole: "member",
      memberships: [{ clinicId: clinic.id, role: "owner" }],
    });

    const result = await useCase.execute({
      actor,
      clinicId: clinic.id,
      patientId: patient.id,
      date: new Date(),
      chiefComplaint: "Dor de cabeça",
    });

    expect(result.attendanceId).toBeTruthy();
  });

  it("bloqueia criar atendimento para paciente de outra clínica", async () => {
    const { clinic, owner } = await seedClinicWithOwnerAndDoctor();
    const otherClinic = await seedClinicWithOwnerAndDoctor();
    const patientFromOtherClinic = await seedPatient(otherClinic.clinic.id);

    const actor = new AuthenticatedActor({
      userId: owner.id,
      platformRole: "member",
      memberships: [{ clinicId: clinic.id, role: "owner" }],
    });

    await expect(
      useCase.execute({
        actor,
        clinicId: clinic.id,
        patientId: patientFromOtherClinic.id,
        date: new Date(),
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("bloqueia editar atendimento de outra clínica mesmo com paciente válido", async () => {
    const { clinic, owner } = await seedClinicWithOwnerAndDoctor();
    const otherClinic = await seedClinicWithOwnerAndDoctor();
    const patientOfOtherClinic = await seedPatient(otherClinic.clinic.id);

    const attendanceOfOtherClinic = ClinicalAttendance.create({
      clinicId: otherClinic.clinic.id,
      patientId: patientOfOtherClinic.id,
      date: new Date(),
    });
    await new DrizzleClinicalAttendanceRepository().save(attendanceOfOtherClinic);

    const patient = await seedPatient(clinic.id);
    const actor = new AuthenticatedActor({
      userId: owner.id,
      platformRole: "member",
      memberships: [{ clinicId: clinic.id, role: "owner" }],
    });

    await expect(
      useCase.execute({
        actor,
        clinicId: clinic.id,
        id: attendanceOfOtherClinic.id,
        patientId: patient.id,
        date: new Date(),
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
