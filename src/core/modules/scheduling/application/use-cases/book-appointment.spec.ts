import { beforeEach, describe, expect, it } from "vitest";

import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { NotFoundError, PlanLimitError } from "@/core/shared/domain/errors";

import { Appointment } from "../../domain/appointment";
import {
  AppointmentConflictError,
  AppointmentInThePastError,
} from "../../domain/errors";
import { FakeBookingDirectory } from "../testing/fake-booking-directory";
import {
  FakeAppointmentNotifier,
  FakeClinicPlanProvider,
  FixedClock,
  InMemoryReminderScheduler,
} from "../testing/fakes";
import { InMemoryAppointmentRepository } from "../testing/in-memory-appointment-repository";
import { BookAppointmentUseCase } from "./book-appointment";

describe("BookAppointmentUseCase", () => {
  const now = new Date("2026-06-15T12:00:00.000Z");
  const future = new Date("2026-06-20T14:00:00.000Z");

  let appointments: InMemoryAppointmentRepository;
  let booking: FakeBookingDirectory;
  let reminders: InMemoryReminderScheduler;
  let notifier: FakeAppointmentNotifier;
  let audit: FakeAuditLog;
  let useCase: BookAppointmentUseCase;

  const baseInput = {
    clinicId: "clinic-1",
    doctorId: "doctor-1",
    scheduledAt: future,
    patientName: "Maria",
    patientEmail: "maria@example.com",
    patientPhoneNumber: "+5511999999999",
    patientSex: "female" as const,
  };

  beforeEach(() => {
    appointments = new InMemoryAppointmentRepository();
    booking = new FakeBookingDirectory();
    reminders = new InMemoryReminderScheduler();
    notifier = new FakeAppointmentNotifier();
    audit = new FakeAuditLog();
    useCase = new BookAppointmentUseCase(
      appointments,
      booking,
      reminders,
      notifier,
      audit,
      new FixedClock(now),
      new FakeClinicPlanProvider(null),
    );
  });

  it("agenda usando o preço do profissional, casa/cria paciente e confirma", async () => {
    const result = await useCase.execute(baseInput);

    expect(result.appointmentId).toBeTruthy();
    expect(appointments.items).toHaveLength(1);
    expect(appointments.items[0].toPrimitives().priceInCents).toBe(20000);
    expect(booking.createdPatients).toHaveLength(1);
    expect(notifier.scheduled).toHaveLength(1);
    expect(reminders.scheduled).toHaveLength(2);
    expect(audit.entries[0].action).toBe("appointment.booked_online");
  });

  it("rejeita quando o profissional não existe na clínica", async () => {
    booking.setProfessional(null);

    await expect(useCase.execute(baseInput)).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(appointments.items).toHaveLength(0);
  });

  it("rejeita conflito de horário", async () => {
    await appointments.save(
      Appointment.create({
        clinicId: "clinic-1",
        patientId: "outro",
        doctorId: "doctor-1",
        scheduledAt: future,
        priceInCents: 10000,
      }),
    );

    await expect(useCase.execute(baseInput)).rejects.toBeInstanceOf(
      AppointmentConflictError,
    );
  });

  it("rejeita data no passado", async () => {
    await expect(
      useCase.execute({
        ...baseInput,
        scheduledAt: new Date("2026-06-10T10:00:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(AppointmentInThePastError);
  });
it("bloqueia o agendamento público ao atingir o limite do plano", async () => {
    for (let i = 0; i < 100; i++) {
      await appointments.save(
        Appointment.create({
          clinicId: "clinic-1",
          patientId: "p",
          doctorId: "d",
          scheduledAt: new Date(Date.UTC(2026, 5, (i % 28) + 1, 9, 0, 0)),
          priceInCents: 10000,
        }),
      );
    }
    const limited = new BookAppointmentUseCase(
      appointments,
      booking,
      reminders,
      notifier,
      audit,
      new FixedClock(now),
      new FakeClinicPlanProvider("essential"),
    );
    await expect(limited.execute(baseInput)).rejects.toBeInstanceOf(
      PlanLimitError,
    );
  });
});
