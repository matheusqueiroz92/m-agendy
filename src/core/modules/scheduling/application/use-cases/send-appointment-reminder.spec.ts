import { beforeEach, describe, expect, it } from "vitest";

import { Appointment } from "../../domain/appointment";
import { FakeAppointmentNotifier } from "../testing/fakes";
import { InMemoryAppointmentRepository } from "../testing/in-memory-appointment-repository";
import { SendAppointmentReminderUseCase } from "./send-appointment-reminder";

describe("SendAppointmentReminderUseCase", () => {
  let appointments: InMemoryAppointmentRepository;
  let notifier: FakeAppointmentNotifier;
  let useCase: SendAppointmentReminderUseCase;

  const scheduledAt = new Date("2026-06-20T14:00:00.000Z");

  beforeEach(() => {
    appointments = new InMemoryAppointmentRepository();
    notifier = new FakeAppointmentNotifier();
    useCase = new SendAppointmentReminderUseCase(appointments, notifier);
  });

  it("envia o lembrete quando o agendamento ainda existe", async () => {
    const appointment = Appointment.create({
      clinicId: "clinic-1",
      patientId: "patient-1",
      doctorId: "doctor-1",
      scheduledAt,
      priceInCents: 15000,
    });
    await appointments.save(appointment);

    const result = await useCase.execute({
      appointmentId: appointment.id,
      to: "+5511999999999",
      patientName: "Maria",
      scheduledAt,
    });

    expect(result.sent).toBe(true);
    expect(notifier.reminders).toHaveLength(1);
    expect(notifier.reminders[0].to).toBe("+5511999999999");
  });

  it("não envia quando o agendamento não existe mais (cancelado)", async () => {
    const result = await useCase.execute({
      appointmentId: "inexistente",
      to: "+5511999999999",
      patientName: "Maria",
      scheduledAt,
    });

    expect(result.sent).toBe(false);
    expect(notifier.reminders).toHaveLength(0);
  });
});
