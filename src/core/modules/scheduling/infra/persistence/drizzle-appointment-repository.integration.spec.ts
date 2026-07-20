import { beforeEach, describe, expect, it } from "vitest";

import {
  seedClinicWithOwnerAndDoctor,
  seedPatient,
} from "@/core/shared/infra/testing/seed-test-data";
import { resetTestDatabase } from "@/core/shared/infra/testing/reset-test-database";

import { Appointment } from "../../domain/appointment";
import { DrizzleAppointmentRepository } from "./drizzle-appointment-repository";

/**
 * Testes de integração: batem no Postgres de teste de verdade (via
 * TEST_DATABASE_URL), diferente dos testes unitários de caso de uso que usam
 * `InMemoryAppointmentRepository`. O objetivo aqui é validar a query em si —
 * isolamento por clínica e detecção de conflito são regras de segurança que
 * nenhum fake consegue garantir sozinho.
 */
describe("DrizzleAppointmentRepository (integração)", () => {
  const repo = new DrizzleAppointmentRepository();

  beforeEach(async () => {
    await resetTestDatabase();
  });

  it("isola a contagem de agendamentos por clínica", async () => {
    const clinicA = await seedClinicWithOwnerAndDoctor();
    const clinicB = await seedClinicWithOwnerAndDoctor();
    const patientA = await seedPatient(clinicA.clinic.id);
    const patientB = await seedPatient(clinicB.clinic.id);

    const start = new Date(Date.UTC(2026, 7, 1));
    const end = new Date(Date.UTC(2026, 8, 1));

    await repo.save(
      Appointment.create({
        clinicId: clinicA.clinic.id,
        patientId: patientA.id,
        doctorId: clinicA.doctor.id,
        scheduledAt: new Date(Date.UTC(2026, 7, 10, 9, 0)),
        priceInCents: 10000,
      }),
    );
    await repo.save(
      Appointment.create({
        clinicId: clinicB.clinic.id,
        patientId: patientB.id,
        doctorId: clinicB.doctor.id,
        scheduledAt: new Date(Date.UTC(2026, 7, 11, 9, 0)),
        priceInCents: 10000,
      }),
    );

    await expect(
      repo.countByClinicInPeriod(clinicA.clinic.id, start, end),
    ).resolves.toBe(1);
    await expect(
      repo.countByClinicInPeriod(clinicB.clinic.id, start, end),
    ).resolves.toBe(1);
  });

  it("detecta conflito de horário do mesmo profissional", async () => {
    const { clinic, doctor } = await seedClinicWithOwnerAndDoctor();
    const patient = await seedPatient(clinic.id);
    const scheduledAt = new Date(Date.UTC(2026, 7, 10, 14, 0));

    await repo.save(
      Appointment.create({
        clinicId: clinic.id,
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt,
        priceInCents: 10000,
      }),
    );

    await expect(
      repo.hasConflict({ clinicId: clinic.id, doctorId: doctor.id, scheduledAt }),
    ).resolves.toBe(true);

    await expect(
      repo.hasConflict({
        clinicId: clinic.id,
        doctorId: doctor.id,
        scheduledAt: new Date(Date.UTC(2026, 7, 10, 15, 0)),
      }),
    ).resolves.toBe(false);
  });

  it("ignora o próprio agendamento na checagem de conflito ao editar", async () => {
    const { clinic, doctor } = await seedClinicWithOwnerAndDoctor();
    const patient = await seedPatient(clinic.id);
    const scheduledAt = new Date(Date.UTC(2026, 7, 10, 14, 0));

    const appointment = Appointment.create({
      clinicId: clinic.id,
      patientId: patient.id,
      doctorId: doctor.id,
      scheduledAt,
      priceInCents: 10000,
    });
    await repo.save(appointment);

    await expect(
      repo.hasConflict({
        clinicId: clinic.id,
        doctorId: doctor.id,
        scheduledAt,
        excludeAppointmentId: appointment.id,
      }),
    ).resolves.toBe(false);
  });

  it("preserva o status ao editar (upsert não reverte confirmação)", async () => {
    const { clinic, doctor } = await seedClinicWithOwnerAndDoctor();
    const patient = await seedPatient(clinic.id);

    const appointment = Appointment.create({
      clinicId: clinic.id,
      patientId: patient.id,
      doctorId: doctor.id,
      scheduledAt: new Date(Date.UTC(2026, 7, 10, 14, 0)),
      priceInCents: 10000,
    });
    await repo.save(appointment);
    await repo.updateStatus(appointment.id, "confirmed");

    // Simula uma edição (ex.: mudar o preço) reenviando o mesmo agendamento.
    const edited = Appointment.restore({
      ...appointment.toPrimitives(),
      priceInCents: 15000,
    });
    await repo.save(edited);

    const reloaded = await repo.findById(appointment.id);
    expect(reloaded?.status).toBe("confirmed");
    expect(reloaded?.priceInCents).toBe(15000);
  });

  it("persiste e recupera o tipo do agendamento (consulta/retorno)", async () => {
    const { clinic, doctor } = await seedClinicWithOwnerAndDoctor();
    const patient = await seedPatient(clinic.id);

    const appointment = Appointment.create({
      clinicId: clinic.id,
      patientId: patient.id,
      doctorId: doctor.id,
      scheduledAt: new Date(Date.UTC(2026, 7, 10, 14, 0)),
      priceInCents: 10000,
      type: "return_visit",
    });
    await repo.save(appointment);

    const reloaded = await repo.findById(appointment.id);
    expect(reloaded?.type).toBe("return_visit");
  });

  it("findById retorna null para agendamento inexistente", async () => {
    await expect(repo.findById(crypto.randomUUID())).resolves.toBeNull();
  });
});
