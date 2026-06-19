import { beforeEach, describe, expect, it } from "vitest";

import { NotFoundError } from "@/core/shared/domain/errors";

import { FakeAvailabilityReader } from "../testing/fake-availability-reader";
import { GetAvailableTimeSlotsUseCase } from "./get-available-time-slots";

describe("GetAvailableTimeSlotsUseCase", () => {
  let reader: FakeAvailabilityReader;
  let useCase: GetAvailableTimeSlotsUseCase;

  beforeEach(() => {
    reader = new FakeAvailabilityReader();
    useCase = new GetAvailableTimeSlotsUseCase(reader);
  });

  it("retorna slots marcando ocupados (2026-06-15 = segunda)", async () => {
    reader.setBookedTimes(["08:30", "09:00"]);

    const { timeSlots } = await useCase.execute({
      clinicId: "clinic-1",
      doctorId: "doctor-1",
      date: "2026-06-15",
    });

    expect(timeSlots).toEqual([
      { time: "08:00", available: true },
      { time: "08:30", available: false },
      { time: "09:00", available: false },
      { time: "09:30", available: true },
    ]);
  });

  it("retorna vazio em dia fora da janela (2026-06-14 = domingo)", async () => {
    const { timeSlots } = await useCase.execute({
      clinicId: "clinic-1",
      doctorId: "doctor-1",
      date: "2026-06-14",
    });
    expect(timeSlots).toEqual([]);
  });

  it("lança NotFound quando o profissional não existe", async () => {
    reader.setAvailability(null);

    await expect(
      useCase.execute({
        clinicId: "clinic-1",
        doctorId: "doctor-x",
        date: "2026-06-15",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
