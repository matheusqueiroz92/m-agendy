import { beforeEach, describe, expect, it } from "vitest";

import { Appointment } from "../../domain/appointment";
import {
  FakeClinicNotifier,
  FakeConfirmationLookup,
} from "../testing/confirmation-fakes";
import { FixedClock } from "../testing/fakes";
import { InMemoryAppointmentRepository } from "../testing/in-memory-appointment-repository";
import { ConfirmAppointmentFromWhatsAppUseCase } from "./confirm-appointment-from-whatsapp";

/** Messenger fake que apenas registra as mensagens enviadas, para asserções. */
class FakeWhatsAppMessenger {
  public readonly sent: { to: string; body: string; clinicId?: string }[] = [];

  async sendText(params: { to: string; body: string; clinicId?: string }): Promise<void> {
    this.sent.push(params);
  }
}

describe("ConfirmAppointmentFromWhatsAppUseCase", () => {
  const now = new Date("2026-06-15T12:00:00.000Z");
  const future = new Date("2026-06-20T14:00:00.000Z");
  const laterFuture = new Date("2026-06-25T10:00:00.000Z");

  let lookup: FakeConfirmationLookup;
  let appointments: InMemoryAppointmentRepository;
  let notifier: FakeClinicNotifier;
  let messenger: FakeWhatsAppMessenger;
  let useCase: ConfirmAppointmentFromWhatsAppUseCase;

  beforeEach(() => {
    lookup = new FakeConfirmationLookup();
    appointments = new InMemoryAppointmentRepository();
    notifier = new FakeClinicNotifier();
    messenger = new FakeWhatsAppMessenger();
    useCase = new ConfirmAppointmentFromWhatsAppUseCase(
      lookup,
      appointments,
      notifier,
      new FixedClock(now),
      messenger,
    );
  });

  it("confirma a única consulta pendente e notifica a clínica", async () => {
    const appointment = Appointment.create({
      clinicId: "clinic-1",
      patientId: "patient-1",
      doctorId: "doctor-1",
      scheduledAt: future,
      priceInCents: 15000,
    });
    await appointments.save(appointment);
    lookup.set("+5511999999999", {
      appointmentId: appointment.id,
      clinicId: "clinic-1",
      patientName: "Maria",
      scheduledAt: future,
    });

    const result = await useCase.execute({ fromPhone: "+5511999999999" });

    expect(result.confirmed).toBe(true);
    expect(appointments.items[0].status).toBe("confirmed");
    expect(notifier.sent).toHaveLength(1);
    expect(notifier.sent[0].patientName).toBe("Maria");
    expect(messenger.sent).toHaveLength(0);
  });

  it("não confirma nada quando não há consulta pendente para o telefone", async () => {
    const result = await useCase.execute({ fromPhone: "+5511000000000" });

    expect(result.confirmed).toBe(false);
    expect(notifier.sent).toHaveLength(0);
    expect(messenger.sent).toHaveLength(0);
  });

  it("não confirma nenhuma quando há mais de uma consulta pendente — pede esclarecimento", async () => {
    const first = Appointment.create({
      clinicId: "clinic-1",
      patientId: "patient-1",
      doctorId: "doctor-1",
      scheduledAt: future,
      priceInCents: 15000,
    });
    const second = Appointment.create({
      clinicId: "clinic-1",
      patientId: "patient-1",
      doctorId: "doctor-2",
      scheduledAt: laterFuture,
      priceInCents: 20000,
    });
    await appointments.save(first);
    await appointments.save(second);
    lookup.set(
      "+5511999999999",
      { appointmentId: first.id, clinicId: "clinic-1", patientName: "Maria", scheduledAt: future },
      { appointmentId: second.id, clinicId: "clinic-1", patientName: "Maria", scheduledAt: laterFuture },
    );

    const result = await useCase.execute({ fromPhone: "+5511999999999" });

    expect(result.confirmed).toBe(false);
    expect(appointments.items.find((a) => a.id === first.id)?.status).toBe("pending");
    expect(appointments.items.find((a) => a.id === second.id)?.status).toBe("pending");
    expect(notifier.sent).toHaveLength(0);
    expect(messenger.sent).toHaveLength(1);
    expect(messenger.sent[0].to).toBe("+5511999999999");
    expect(messenger.sent[0].body).toContain("mais de uma consulta pendente");
    expect(messenger.sent[0].clinicId).toBe("clinic-1");
  });
});
