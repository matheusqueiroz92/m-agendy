import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError } from "@/core/shared/domain/errors";

import { Appointment } from "../../domain/appointment";
import { FakeAppointmentContactDirectory } from "../testing/fake-appointment-contact-directory";
import { FakeAppointmentNotifier, InMemoryReminderScheduler } from "../testing/fakes";
import { InMemoryAppointmentRepository } from "../testing/in-memory-appointment-repository";
import { CancelAppointmentUseCase } from "./cancel-appointment";

describe("CancelAppointmentUseCase", () => {
  let appointments: InMemoryAppointmentRepository;
  let audit: FakeAuditLog;
  let reminders: InMemoryReminderScheduler;
  let notifier: FakeAppointmentNotifier;
  let contacts: FakeAppointmentContactDirectory;
  let useCase: CancelAppointmentUseCase;

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
    notifier = new FakeAppointmentNotifier();
    contacts = new FakeAppointmentContactDirectory();
    useCase = new CancelAppointmentUseCase(
      appointments,
      new Authorizer(),
      audit,
      reminders,
      notifier,
      contacts,
    );
  });

  it("cancela o agendamento (preserva o registro), cancela lembretes, avisa o paciente e registra auditoria", async () => {
    const appointment = makeAppointment();
    await appointments.save(appointment);
    reminders.scheduled.push({
      appointmentId: appointment.id,
      clinicId: "clinic-1",
      runAt: new Date(),
      to: "+5511999999999",
      patientName: "Maria",
      scheduledAt: appointment.toPrimitives().scheduledAt,
    });
    contacts.setContact({
      patientName: "Maria",
      patientPhoneNumber: "+5511999999999",
      doctorName: "Dr. João",
    });

    await useCase.execute({
      actor: manager,
      clinicId: "clinic-1",
      appointmentId: appointment.id,
    });

    const updated = await appointments.findById(appointment.id);
    expect(updated).not.toBeNull();
    expect(updated?.toPrimitives().status).toBe("cancelled");
    expect(
      reminders.scheduled.filter((r) => r.appointmentId === appointment.id),
    ).toHaveLength(0);
    expect(notifier.cancelled).toHaveLength(1);
    expect(notifier.cancelled[0].to).toBe("+5511999999999");
    expect(audit.entries[0].action).toBe("appointment.cancelled");
  });

  it("não avisa o paciente quando não há telefone de contato", async () => {
    const appointment = makeAppointment();
    await appointments.save(appointment);
    contacts.setContact(null);

    await useCase.execute({
      actor: manager,
      clinicId: "clinic-1",
      appointmentId: appointment.id,
    });

    expect(notifier.cancelled).toHaveLength(0);
    expect((await appointments.findById(appointment.id))?.toPrimitives().status).toBe(
      "cancelled",
    );
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
      "cancelled",
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
