import { beforeEach, describe, expect, it } from "vitest";

import { Appointment } from "../../domain/appointment";
import {
  FakeClinicNotifier,
  FakeConfirmationLookup,
} from "../testing/confirmation-fakes";
import { FixedClock } from "../testing/fakes";
import { InMemoryAppointmentRepository } from "../testing/in-memory-appointment-repository";
import { ConfirmAppointmentFromWhatsAppUseCase } from "./confirm-appointment-from-whatsapp";

describe("ConfirmAppointmentFromWhatsAppUseCase", () => {
  const now = new Date("2026-06-15T12:00:00.000Z");
  const future = new Date("2026-06-20T14:00:00.000Z");

  let lookup: FakeConfirmationLookup;
  let appointments: InMemoryAppointmentRepository;
  let notifier: FakeClinicNotifier;
  let useCase: ConfirmAppointmentFromWhatsAppUseCase;

  beforeEach(() => {
    lookup = new FakeConfirmationLookup();
    appointments = new InMemoryAppointmentRepository();
    notifier = new FakeClinicNotifier();
    useCase = new ConfirmAppointmentFromWhatsAppUseCase(
      lookup,
      appointments,
      notifier,
      new FixedClock(now),
    );
  });

  it("confirma a consulta pendente e notifica a clínica", async () => {
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
  });

  it("não confirma nada quando não há consulta pendente para o telefone", async () => {
    const result = await useCase.execute({ fromPhone: "+5511000000000" });

    expect(result.confirmed).toBe(false);
    expect(notifier.sent).toHaveLength(0);
  });
});
