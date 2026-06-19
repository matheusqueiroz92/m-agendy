import { beforeEach, describe, expect, it } from "vitest";

import { PlanLimitError } from "@/core/shared/domain/errors";

import { Appointment } from "../../domain/appointment";
import {
  AppointmentConflictError,
  AppointmentInThePastError,
  InvalidAppointmentPriceError,
} from "../../domain/errors";
import {
  FakeAppointmentNotifier,
  FakeClinicPlanProvider,
  FixedClock,
  InMemoryReminderScheduler,
} from "../testing/fakes";
import { InMemoryAppointmentRepository } from "../testing/in-memory-appointment-repository";
import { ScheduleAppointmentUseCase } from "./schedule-appointment";

describe("ScheduleAppointmentUseCase", () => {
  const now = new Date("2026-06-15T12:00:00.000Z");
  const future = new Date("2026-06-20T14:00:00.000Z");

  let appointments: InMemoryAppointmentRepository;
  let notifier: FakeAppointmentNotifier;
  let reminders: InMemoryReminderScheduler;
  let useCase: ScheduleAppointmentUseCase;

  const baseInput = {
    clinicId: "clinic-1",
    patientId: "patient-1",
    doctorId: "doctor-1",
    scheduledAt: future,
    priceInCents: 15000,
  };

  beforeEach(() => {
    appointments = new InMemoryAppointmentRepository();
    notifier = new FakeAppointmentNotifier();
    reminders = new InMemoryReminderScheduler();
    useCase = new ScheduleAppointmentUseCase(
      appointments,
      notifier,
      reminders,
      new FixedClock(now),
      new FakeClinicPlanProvider(null),
    );
  });

  it("agenda a consulta e persiste o agendamento", async () => {
    const result = await useCase.execute(baseInput);

    expect(result.appointmentId).toBeTruthy();
    expect(appointments.items).toHaveLength(1);
    expect(appointments.items[0].toPrimitives().clinicId).toBe("clinic-1");
  });

  it("notifica o paciente e agenda lembretes quando há telefone", async () => {
    const result = await useCase.execute({
      ...baseInput,
      patientName: "Maria",
      patientPhoneNumber: "+5511999999999",
    });

    expect(notifier.scheduled).toHaveLength(1);
    expect(notifier.scheduled[0].patientName).toBe("Maria");
    // 24h e 2h antes — ambos no futuro em relação a `now`.
    expect(reminders.scheduled).toHaveLength(2);
    expect(
      reminders.scheduled.every(
        (reminder) => reminder.appointmentId === result.appointmentId,
      ),
    ).toBe(true);
    // Ordenados do mais cedo para o mais tarde (24h antes, depois 2h antes).
    expect(reminders.scheduled[0].runAt.getTime()).toBeLessThan(
      reminders.scheduled[1].runAt.getTime(),
    );
  });

  it("não notifica nem agenda lembretes quando não há telefone", async () => {
    await useCase.execute(baseInput);
    expect(notifier.scheduled).toHaveLength(0);
    expect(reminders.scheduled).toHaveLength(0);
  });

  it("rejeita agendamento em horário já ocupado para o mesmo médico", async () => {
    await appointments.save(
      Appointment.create({
        clinicId: "clinic-1",
        patientId: "outro-paciente",
        doctorId: "doctor-1",
        scheduledAt: future,
        priceInCents: 10000,
      }),
    );

    await expect(useCase.execute(baseInput)).rejects.toBeInstanceOf(
      AppointmentConflictError,
    );
    expect(appointments.items).toHaveLength(1);
  });

  it("rejeita agendamento em data passada", async () => {
    await expect(
      useCase.execute({
        ...baseInput,
        scheduledAt: new Date("2026-06-10T10:00:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(AppointmentInThePastError);
  });

  it("rejeita preço inválido (invariante de domínio)", async () => {
    await expect(
      useCase.execute({ ...baseInput, priceInCents: 0 }),
    ).rejects.toBeInstanceOf(InvalidAppointmentPriceError);
  });
it("bloqueia ao atingir o limite mensal do plano (essential)", async () => {
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
    const limited = new ScheduleAppointmentUseCase(
      appointments,
      notifier,
      reminders,
      new FixedClock(now),
      new FakeClinicPlanProvider("essential"),
    );
    await expect(limited.execute(baseInput)).rejects.toBeInstanceOf(
      PlanLimitError,
    );
  });
}); // fim describe ScheduleAppointmentUseCase
