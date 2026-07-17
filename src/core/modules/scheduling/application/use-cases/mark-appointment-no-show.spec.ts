import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { Appointment } from "../../domain/appointment";
import { InMemoryAppointmentRepository } from "../testing/in-memory-appointment-repository";
import { MarkAppointmentNoShowUseCase } from "./mark-appointment-no-show";

describe("MarkAppointmentNoShowUseCase", () => {
  let appointments: InMemoryAppointmentRepository;
  let audit: FakeAuditLog;
  let useCase: MarkAppointmentNoShowUseCase;

  const manager = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "manager" }],
  });

  const makeAppointment = (clinicId = "clinic-1") =>
    Appointment.create({
      clinicId,
      patientId: "patient-1",
      doctorId: "doctor-1",
      scheduledAt: new Date("2026-06-20T14:00:00.000Z"),
      priceInCents: 15000,
    });

  beforeEach(() => {
    appointments = new InMemoryAppointmentRepository();
    audit = new FakeAuditLog();
    useCase = new MarkAppointmentNoShowUseCase(
      appointments,
      new Authorizer(),
      audit,
    );
  });

  it("marca o agendamento como falta e registra auditoria", async () => {
    const appointment = makeAppointment();
    await appointments.save(appointment);

    await useCase.execute({
      actor: manager,
      clinicId: "clinic-1",
      appointmentId: appointment.id,
    });

    const updated = await appointments.findById(appointment.id);
    expect(updated?.toPrimitives().status).toBe("no_show");
    expect(audit.entries[0].action).toBe("appointment.no_show");
  });

  it("falha quando o agendamento é de outra clínica", async () => {
    const appointment = makeAppointment("clinic-2");
    await appointments.save(appointment);

    await expect(
      useCase.execute({
        actor: manager,
        clinicId: "clinic-1",
        appointmentId: appointment.id,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect((await appointments.findById(appointment.id))?.toPrimitives().status).not.toBe(
      "no_show",
    );
  });

  it("nega quando o ator não pode gerenciar a clínica", async () => {
    const appointment = makeAppointment();
    await appointments.save(appointment);
    const professional = new AuthenticatedActor({
      userId: "u2",
      platformRole: "member",
      memberships: [{ clinicId: "clinic-1", role: "professional" }],
    });

    await expect(
      useCase.execute({
        actor: professional,
        clinicId: "clinic-1",
        appointmentId: appointment.id,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
