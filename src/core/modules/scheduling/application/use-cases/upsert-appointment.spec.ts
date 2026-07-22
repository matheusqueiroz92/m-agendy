import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { FakeAuditLog } from "@/core/shared/application/testing/fake-audit-log";
import { ForbiddenError, NotFoundError, PlanLimitError } from "@/core/shared/domain/errors";

import { Appointment } from "../../domain/appointment";
import {
  AppointmentConflictError,
  AppointmentInThePastError,
} from "../../domain/errors";
import { FakeAppointmentContactDirectory } from "../testing/fake-appointment-contact-directory";
import { FakeAvailabilityReader } from "../testing/fake-availability-reader";
import {
  FakeAppointmentNotifier,
  FakeClinicReminderPreference,
  FixedClock,
  InMemoryReminderScheduler,
} from "../testing/fakes";
import { FakeClinicNotifier } from "../testing/confirmation-fakes";
import { InMemoryAppointmentRepository } from "../testing/in-memory-appointment-repository";
import { UpsertAppointmentUseCase } from "./upsert-appointment";

describe("UpsertAppointmentUseCase", () => {
  const now = new Date("2026-06-15T12:00:00.000Z");
  const future = new Date("2026-06-20T14:00:00.000Z");

  let appointments: InMemoryAppointmentRepository;
  let audit: FakeAuditLog;
  let reminders: InMemoryReminderScheduler;
  let notifier: FakeAppointmentNotifier;
  let contacts: FakeAppointmentContactDirectory;
  let availability: FakeAvailabilityReader;
  let clinicNotifier: FakeClinicNotifier;
  let useCase: UpsertAppointmentUseCase;

  const manager = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "manager" }],
  });

  const baseInput = {
    actor: manager,
    clinicId: "clinic-1",
    patientId: "patient-1",
    doctorId: "doctor-1",
    scheduledAt: future,
    priceInCents: 15000,
  };

  beforeEach(() => {
    appointments = new InMemoryAppointmentRepository();
    audit = new FakeAuditLog();
    reminders = new InMemoryReminderScheduler();
    notifier = new FakeAppointmentNotifier();
    contacts = new FakeAppointmentContactDirectory({
      patientName: "Maria",
      patientPhoneNumber: "+5511999999999",
      doctorName: "Dr. House",
    });
    availability = new FakeAvailabilityReader();
    availability.setAvailability({
      windows: [
        { weekDay: 6, startTime: "08:00:00", endTime: "18:00:00" }, // sábado 2026-06-20
      ],
      defaultAppointmentDurationInMinutes: 30,
    });
    clinicNotifier = new FakeClinicNotifier();
    useCase = new UpsertAppointmentUseCase(
      appointments,
      new Authorizer(),
      audit,
      new FixedClock(now),
      reminders,
      notifier,
      contacts,
      availability,
      clinicNotifier,
      new FakeClinicReminderPreference(true),
    );
  });

  it("cria um agendamento e registra auditoria", async () => {
    const result = await useCase.execute(baseInput);

    expect(appointments.items).toHaveLength(1);
    expect(result.appointmentId).toBeTruthy();
    expect(audit.entries[0].action).toBe("appointment.created");
  });

  it("cria um agendamento como 'consulta' por padrão quando o tipo não é informado", async () => {
    await useCase.execute(baseInput);

    expect(appointments.items[0].type).toBe("consultation");
  });

  it("cria um agendamento de retorno quando o tipo é informado", async () => {
    await useCase.execute({ ...baseInput, type: "return_visit" });

    expect(appointments.items[0].type).toBe("return_visit");
  });

  it("permite alterar o tipo do agendamento na edição", async () => {
    const existing = Appointment.create({
      clinicId: "clinic-1",
      patientId: "patient-1",
      doctorId: "doctor-1",
      scheduledAt: future,
      priceInCents: 10000,
      type: "consultation",
    });
    await appointments.save(existing);

    await useCase.execute({
      ...baseInput,
      id: existing.id,
      type: "return_visit",
    });

    const updated = await appointments.findById(existing.id);
    expect(updated?.type).toBe("return_visit");
  });

  it("envia confirmação e agenda lembretes quando há telefone", async () => {
    await useCase.execute(baseInput);

    expect(notifier.scheduled).toHaveLength(1);
    expect(notifier.scheduled[0].patientName).toBe("Maria");
    expect(reminders.scheduled).toHaveLength(2);
  });

  it("não notifica nem agenda lembretes quando paciente não tem telefone", async () => {
    contacts.setContact({
      patientName: "Maria",
      patientPhoneNumber: null,
      doctorName: "Dr. House",
    });

    await useCase.execute(baseInput);

    expect(notifier.scheduled).toHaveLength(0);
    expect(reminders.scheduled).toHaveLength(0);
  });

  it("reagenda lembretes na edição (cancela os antigos)", async () => {
    const existing = Appointment.create({
      clinicId: "clinic-1",
      patientId: "patient-1",
      doctorId: "doctor-1",
      scheduledAt: future,
      priceInCents: 10000,
    });
    await appointments.save(existing);
    reminders.scheduled.push({
      appointmentId: existing.id,
      clinicId: "clinic-1",
      runAt: now,
      to: "+5511999999999",
      patientName: "Maria",
      scheduledAt: future,
    });

    await useCase.execute({ ...baseInput, id: existing.id });

    // Os 2 antigos foram cancelados e 2 novos agendados.
    expect(
      reminders.scheduled.filter((r) => r.appointmentId === existing.id),
    ).toHaveLength(2);
    expect(audit.entries[0].action).toBe("appointment.updated");
  });

  it("confirma o agendamento mas não agenda lembretes quando a clínica desativou o toggle", async () => {
    const withRemindersDisabled = new UpsertAppointmentUseCase(
      appointments,
      new Authorizer(),
      audit,
      new FixedClock(now),
      reminders,
      notifier,
      contacts,
      availability,
      clinicNotifier,
      new FakeClinicReminderPreference(false),
    );

    await withRemindersDisabled.execute(baseInput);

    expect(notifier.scheduled).toHaveLength(1);
    expect(reminders.scheduled).toHaveLength(0);
  });

  it("rejeita conflito de horário do mesmo profissional", async () => {
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

  it("bloqueia criação ao atingir o limite mensal do plano (essential = 100)", async () => {
    for (let i = 0; i < 100; i++) {
      await appointments.save(
        Appointment.create({
          clinicId: "clinic-1",
          patientId: "p",
          doctorId: "d",
          scheduledAt: new Date(Date.UTC(2026, 5, (i % 28) + 1, 10, 0, 0)),
          priceInCents: 10000,
        }),
      );
    }

    await expect(
      useCase.execute({ ...baseInput, plan: "essential" }),
    ).rejects.toBeInstanceOf(PlanLimitError);
  });

  it("bloqueia criação ao atingir o limite diário do plano (essential = 15/dia)", async () => {
    for (let i = 0; i < 15; i++) {
      await appointments.save(
        Appointment.create({
          clinicId: "clinic-1",
          patientId: "p",
          doctorId: "doctor-x",
          scheduledAt: new Date(Date.UTC(2026, 6, 1 + i, 10, 0, 0)),
          priceInCents: 10000,
        }),
        now, // criado "hoje" (mesmo dia de `now`, no fuso da clínica)
      );
    }

    await expect(
      useCase.execute({ ...baseInput, plan: "essential" }),
    ).rejects.toBeInstanceOf(PlanLimitError);
  });

  it("avisa a clínica quando faltar 1 agendamento para o limite diário (essential = 15/dia)", async () => {
    for (let i = 0; i < 13; i++) {
      await appointments.save(
        Appointment.create({
          clinicId: "clinic-1",
          patientId: "p",
          doctorId: "doctor-x",
          scheduledAt: new Date(Date.UTC(2026, 6, 1 + i, 10, 0, 0)),
          priceInCents: 10000,
        }),
        now,
      );
    }

    // Este é o 14º agendamento criado hoje — falta exatamente 1 para os 15.
    await useCase.execute({ ...baseInput, plan: "essential" });

    expect(clinicNotifier.dailyLimitWarnings).toEqual([
      { clinicId: "clinic-1", limit: 15 },
    ]);
  });

  it("não avisa quando ainda está longe do limite diário", async () => {
    await useCase.execute({ ...baseInput, plan: "essential" });

    expect(clinicNotifier.dailyLimitWarnings).toHaveLength(0);
  });

  it("rejeita data no passado", async () => {
    await expect(
      useCase.execute({
        ...baseInput,
        scheduledAt: new Date("2026-06-10T10:00:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(AppointmentInThePastError);
  });

  it("impede editar agendamento de outra clínica", async () => {
    const other = Appointment.create({
      clinicId: "clinic-2",
      patientId: "p",
      doctorId: "d",
      scheduledAt: future,
      priceInCents: 10000,
    });
    await appointments.save(other);

    await expect(
      useCase.execute({ ...baseInput, id: other.id }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("nega quando o ator não pode gerenciar a clínica", async () => {
    const professional = new AuthenticatedActor({
      userId: "u2",
      platformRole: "member",
      memberships: [{ clinicId: "clinic-1", role: "professional" }],
    });

    await expect(
      useCase.execute({ ...baseInput, actor: professional }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
