import { describe, expect, it } from "vitest";

import {
  combineDateTime,
  formatNumberedList,
  isCancel,
  parseDate,
  parseSelection,
  toISODate,
} from "./chatbot";

describe("chatbot helpers", () => {
  it("parseSelection aceita 1..max e rejeita o resto", () => {
    expect(parseSelection("2", 3)).toBe(1);
    expect(parseSelection("1", 3)).toBe(0);
    expect(parseSelection("0", 3)).toBeNull();
    expect(parseSelection("4", 3)).toBeNull();
    expect(parseSelection("abc", 3)).toBeNull();
  });

  it("parseDate interpreta DD/MM/AAAA e DD/MM", () => {
    const today = new Date("2026-06-15T12:00:00.000Z");
    expect(toISODate(parseDate("20/06/2026", today)!)).toBe("2026-06-20");
    expect(toISODate(parseDate("20/06", today)!)).toBe("2026-06-20");
    expect(parseDate("31/02/2026", today)).toBeNull();
    expect(parseDate("xx", today)).toBeNull();
  });

  it("combineDateTime junta data e horário", () => {
    const d = combineDateTime("2026-06-20", "14:30");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getHours()).toBe(14);
    expect(d.getMinutes()).toBe(30);
  });

  it("isCancel reconhece palavras de cancelamento", () => {
    expect(isCancel("Cancelar")).toBe(true);
    expect(isCancel("sair")).toBe(true);
    expect(isCancel("oi")).toBe(false);
  });

  it("formatNumberedList numera os itens", () => {
    expect(formatNumberedList(["A", "B"])).toBe("1. A\n2. B");
  });
});
