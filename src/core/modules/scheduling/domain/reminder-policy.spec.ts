import { describe, expect, it } from "vitest";

import { computeReminderTimes } from "./reminder-policy";

describe("computeReminderTimes", () => {
  const scheduledAt = new Date("2026-06-20T14:00:00.000Z");

  it("retorna 24h e 2h antes quando ambos estão no futuro", () => {
    const now = new Date("2026-06-15T12:00:00.000Z");
    const times = computeReminderTimes(scheduledAt, now);

    expect(times).toHaveLength(2);
    expect(times[0].toISOString()).toBe("2026-06-19T14:00:00.000Z"); // 24h antes
    expect(times[1].toISOString()).toBe("2026-06-20T12:00:00.000Z"); // 2h antes
  });

  it("descarta lembretes cujo horário de disparo já passou", () => {
    // 13h do mesmo dia: o lembrete de 24h antes já passou; só sobra o de 2h.
    const now = new Date("2026-06-20T13:00:00.000Z");
    const times = computeReminderTimes(scheduledAt, now);

    expect(times).toHaveLength(0);
  });

  it("respeita offsets customizados", () => {
    const now = new Date("2026-06-15T12:00:00.000Z");
    const times = computeReminderTimes(scheduledAt, now, [60]); // 1h antes
    expect(times).toHaveLength(1);
    expect(times[0].toISOString()).toBe("2026-06-20T13:00:00.000Z");
  });
});
