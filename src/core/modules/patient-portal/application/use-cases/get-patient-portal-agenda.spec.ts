import { beforeEach, describe, expect, it } from "vitest";

import { FixedClock } from "@/core/modules/scheduling/application/testing/fakes";

import { PortalAppointment } from "../ports/patient-appointments-reader";
import {
  FakePatientAppointmentsReader,
  FakePortalPatientDirectory,
} from "../testing/fakes";
import { GetPatientPortalAgendaUseCase } from "./get-patient-portal-agenda";

describe("GetPatientPortalAgendaUseCase", () => {
  const now = new Date("2026-06-15T12:00:00.000Z");

  const makeAppointment = (
    id: string,
    iso: string,
  ): PortalAppointment => ({
    id,
    scheduledAt: new Date(iso),
    doctorName: "Dr. House",
    clinicName: "Clínica X",
    priceInCents: 15000,
  });

  let patients: FakePortalPatientDirectory;

  const build = (appointments: PortalAppointment[]) => {
    const reader = new FakePatientAppointmentsReader(
      new Map([["patient-1", appointments]]),
    );
    return new GetPatientPortalAgendaUseCase(
      patients,
      reader,
      new FixedClock(now),
    );
  };

  beforeEach(() => {
    patients = new FakePortalPatientDirectory();
  });

  it("separa próximas (ordem crescente) e passadas (decrescente)", async () => {
    patients.byUserId.set("user-1", {
      id: "patient-1",
      name: "Maria",
      clinicId: "clinic-1",
    });
    const useCase = build([
      makeAppointment("a-past", "2026-06-01T10:00:00.000Z"),
      makeAppointment("a-future-2", "2026-06-25T10:00:00.000Z"),
      makeAppointment("a-future-1", "2026-06-20T10:00:00.000Z"),
    ]);

    const result = await useCase.execute({
      userId: "user-1",
      email: "maria@example.com",
    });

    expect(result.linked).toBe(true);
    expect(result.patientName).toBe("Maria");
    expect(result.upcoming.map((a) => a.id)).toEqual([
      "a-future-1",
      "a-future-2",
    ]);
    expect(result.past.map((a) => a.id)).toEqual(["a-past"]);
  });

  it("auto-vincula por e-mail quando a conta ainda não tem paciente", async () => {
    patients.unlinkedByEmail.set("maria@example.com", {
      id: "patient-1",
      name: "Maria",
      clinicId: "clinic-1",
    });
    const useCase = build([
      makeAppointment("a1", "2026-06-20T10:00:00.000Z"),
    ]);

    const result = await useCase.execute({
      userId: "user-1",
      email: "maria@example.com",
    });

    expect(result.linked).toBe(true);
    expect(result.upcoming).toHaveLength(1);
    // O vínculo passou a existir por userId.
    expect(patients.byUserId.get("user-1")?.id).toBe("patient-1");
  });

  it("retorna não vinculado quando não há paciente para a conta/e-mail", async () => {
    const useCase = build([]);

    const result = await useCase.execute({
      userId: "user-sem-paciente",
      email: "ninguem@example.com",
    });

    expect(result.linked).toBe(false);
    expect(result.patientName).toBeNull();
    expect(result.upcoming).toHaveLength(0);
    expect(result.past).toHaveLength(0);
  });
});
