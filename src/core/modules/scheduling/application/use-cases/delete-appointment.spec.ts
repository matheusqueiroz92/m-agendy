import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { Appointment } from "../../domain/appointment";
import { InMemoryReminderScheduler } from "../testing/fakes";
import { InMemoryAppointmentRepository } from "../testing/in-memory-appointment-repository";
import { DeleteAppointmentUseCase } from "./delete-appointment";

describe("DeleteAppointmentUseCase", () => {
  let appointments: InMemoryAppointmentRepository;
  let audit: FakeAuditLog;
  let reminders: InMemoryReminderScheduler;
  let useCase: DeleteAppointmentUseCase;

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
    reminders = new InMemoryReminderScheduler();
    useCase = new DeleteAppointmentUseCase(
      appointments,
      new Authorizer(),
      audit,
      reminders,
    );
  });

  it("remove o agendamento, cancela lembretes e registra auditoria", async () => {
    const appointment = makeAppointment();
    await appointments.save(appointment);
    reminders.scheduled.push({
      appointmentId: appointment.id,
      runAt: new Date(),
      to: "+5511999999999",
      patientName: "Maria",
      scheduledAt: appointment.toPrimitives().scheduledAt,
    });

    await useCase.execute({
      actor: manager,
      clinicId: "clinic-1",
      appointmentId: appointment.id,
    });

    expect(appointments.items).toHaveLength(0);
    expect(
      reminders.scheduled.filter((r) => r.appointmentId === appointment.id),
    ).toHaveLength(0);
    expect(audit.entries[0].action).toBe("appointment.deleted");
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
    expect(appointments.items).toHaveLength(1);
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
    expect(appointments.items).toHaveLength(1);
  });
});
