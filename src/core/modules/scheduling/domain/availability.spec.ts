import { describe, expect, it } from "vitest";

import {
  computeAvailableSlots,
  generateTimeSlots,
  isDayAvailable,
} from "./availability";

describe("availability", () => {
  describe("generateTimeSlots", () => {
    it("gera slots de 30 em 30 min no intervalo [from, to)", () => {
      expect(generateTimeSlots("08:00:00", "10:00:00")).toEqual([
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
      expect(isDayAvailable(6, 5, 1)).toBe(true); // sábado
      expect(isDayAvailable(0, 5, 1)).toBe(true); // domingo
      expect(isDayAvailable(3, 5, 1)).toBe(false); // quarta
    });
  });

  describe("computeAvailableSlots", () => {
    const availability = {
      availableFromWeekDay: 1,
      availableToWeekDay: 5,
      availableFromTime: "08:00:00",
      availableToTime: "09:30:00",
    };

    it("marca horários ocupados como indisponíveis", () => {
      // 2026-06-15 é uma segunda-feira.
      const slots = computeAvailableSlots("2026-06-15", availability, ["08:30"]);
      expect(slots).toEqual([
        { time: "08:00", available: true },
        { time: "08:30", available: false },
        { time: "09:00", available: true },
      ]);
    });

    it("retorna vazio quando o dia não está na janela de atendimento", () => {
      // 2026-06-14 é um domingo (fora de seg–sex).
      expect(computeAvailableSlots("2026-06-14", availability, [])).toEqual([]);
    });
  });
});
