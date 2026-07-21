import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { beforeEach, describe, expect, it } from "vitest";

import { CLINIC_TIMEZONE } from "@/core/shared/domain/combine-date-and-time";
import { NotFoundError } from "@/core/shared/domain/errors";

import { FakeAvailabilityReader } from "../testing/fake-availability-reader";
import { GetAvailableTimeSlotsUseCase } from "./get-available-time-slots";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Constrói um instante a partir de um horário de parede no fuso da clínica
 * (`America/Sao_Paulo`) — evita depender do fuso LOCAL de quem roda o teste,
 * já que `computeAvailableSlots`/`isWithinAvailability` agora leem/constroem
 * datas explicitamente em `CLINIC_TIMEZONE`.
 */
const brt = (y: number, m: number, d: number, h: number, min = 0): Date =>
  dayjs
    .tz(
      `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")} ${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
      CLINIC_TIMEZONE,
    )
    .toDate();

describe("GetAvailableTimeSlotsUseCase", () => {
  let reader: FakeAvailabilityReader;
  let useCase: GetAvailableTimeSlotsUseCase;

  beforeEach(() => {
    reader = new FakeAvailabilityReader();
    useCase = new GetAvailableTimeSlotsUseCase(reader);
  });

  it("retorna slots marcando ocupados (2026-06-15 = segunda)", async () => {
    reader.setOccupied([
      {
        start: brt(2026, 5, 15, 8, 30),
        end: brt(2026, 5, 15, 9, 0),
      },
      {
        start: brt(2026, 5, 15, 9, 0),
        end: brt(2026, 5, 15, 9, 30),
      },
    ]);

    const { timeSlots } = await useCase.execute({
      clinicId: "clinic-1",
      doctorId: "doctor-1",
      date: "2026-06-15",
    });

    const byTime = Object.fromEntries(
      timeSlots.map((s) => [s.time, s.available]),
    );
    expect(byTime["08:00"]).toBe(true);
    expect(byTime["08:30"]).toBe(false);
    expect(byTime["09:00"]).toBe(false);
    expect(byTime["09:30"]).toBe(true);
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
