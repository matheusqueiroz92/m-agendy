import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { describe, expect, it } from "vitest";

import { CLINIC_TIMEZONE } from "@/core/shared/domain/combine-date-and-time";

import {
  computeAvailableSlots,
  generateTimeSlots,
  intervalsOverlap,
  isDayAvailable,
  isWithinAvailability,
} from "./availability";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Constrói um instante a partir de um horário de parede no fuso da clínica
 * (`America/Sao_Paulo`) — em vez de `new Date(y, m, d, h, min)`, que usaria o
 * fuso LOCAL de quem roda o teste (CI normalmente é UTC) e quebraria de forma
 * imprevisível, já que `isWithinAvailability`/`computeAvailableSlots` agora
 * leem/constroem datas explicitamente no fuso da clínica.
 */
const brt = (y: number, m: number, d: number, h: number, min = 0): Date =>
  dayjs
    .tz(
      `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")} ${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
      CLINIC_TIMEZONE,
    )
    .toDate();

describe("availability", () => {
  describe("generateTimeSlots", () => {
    it("gera slots de 15 em 15 min no intervalo [from, to)", () => {
      expect(generateTimeSlots("08:00:00", "09:00:00", 15)).toEqual([
        "08:00",
        "08:15",
        "08:30",
        "08:45",
      ]);
    });

    it("aceita passo de 30 min", () => {
      expect(generateTimeSlots("08:00:00", "10:00:00", 30)).toEqual([
        "08:00",
        "08:30",
        "09:00",
        "09:30",
      ]);
    });
  });

  describe("isDayAvailable", () => {
    it("intervalo normal (seg–sex)", () => {
      expect(isDayAvailable(3, 1, 5)).toBe(true);
      expect(isDayAvailable(0, 1, 5)).toBe(false);
      expect(isDayAvailable(6, 1, 5)).toBe(false);
    });

    it("intervalo com volta na semana (sex–seg)", () => {
      expect(isDayAvailable(6, 5, 1)).toBe(true);
      expect(isDayAvailable(0, 5, 1)).toBe(true);
      expect(isDayAvailable(3, 5, 1)).toBe(false);
    });
  });

  describe("intervalsOverlap", () => {
    const t = (h: number, m = 0) => new Date(2026, 5, 15, h, m);

    it("detecta overlap parcial", () => {
      expect(intervalsOverlap(t(8), t(8, 45), t(8, 30), t(9))).toBe(true);
    });

    it("não overlap quando um termina no início do outro", () => {
      expect(intervalsOverlap(t(8), t(8, 30), t(8, 30), t(9))).toBe(false);
    });
  });

  describe("isWithinAvailability", () => {
    const windows = [
      { weekDay: 1, startTime: "08:00:00", endTime: "12:00:00" },
      { weekDay: 1, startTime: "14:00:00", endTime: "18:00:00" },
    ];

    it("aceita horário na janela da manhã", () => {
      // 2026-06-15 é segunda
      expect(isWithinAvailability(brt(2026, 5, 15, 8, 0), 30, windows)).toBe(
        true,
      );
    });

    it("rejeita horário no intervalo de almoço", () => {
      expect(isWithinAvailability(brt(2026, 5, 15, 12, 0), 30, windows)).toBe(
        false,
      );
    });

    it("rejeita se a duração ultrapassa o fim da janela", () => {
      expect(isWithinAvailability(brt(2026, 5, 15, 11, 45), 30, windows)).toBe(
        false,
      );
    });
  });

  describe("computeAvailableSlots", () => {
    const windows = [
      { weekDay: 1, startTime: "08:00:00", endTime: "09:30:00" },
    ];

    it("marca horários ocupados considerando duração", () => {
      const occupied = [
        {
          start: brt(2026, 5, 15, 8, 0),
          end: brt(2026, 5, 15, 8, 30),
        },
      ];
      const slots = computeAvailableSlots(
        "2026-06-15",
        windows,
        occupied,
        30,
      );
      const byTime = Object.fromEntries(
        slots.map((s) => [s.time, s.available]),
      );
      expect(byTime["08:00"]).toBe(false);
      expect(byTime["08:15"]).toBe(false);
      expect(byTime["08:30"]).toBe(true);
      expect(byTime["09:00"]).toBe(true);
    });

    it("retorna vazio quando o dia não tem janelas", () => {
      expect(computeAvailableSlots("2026-06-14", windows, [], 30)).toEqual([]);
    });

    it("suporta múltiplas janelas no mesmo dia", () => {
      const multi = [
        { weekDay: 1, startTime: "08:00:00", endTime: "09:00:00" },
        { weekDay: 1, startTime: "14:00:00", endTime: "15:00:00" },
      ];
      const slots = computeAvailableSlots("2026-06-15", multi, [], 30);
      const times = slots.filter((s) => s.available).map((s) => s.time);
      expect(times).toContain("08:00");
      expect(times).toContain("08:30");
      expect(times).toContain("14:00");
      expect(times).toContain("14:30");
      expect(times).not.toContain("12:00");
    });
  });
});
