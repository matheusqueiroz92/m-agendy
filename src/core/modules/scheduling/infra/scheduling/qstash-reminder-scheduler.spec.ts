import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { QStashReminderScheduler } from "./qstash-reminder-scheduler";

vi.mock("@/db", () => ({
  db: {
    insert: () => ({ values: vi.fn() }),
    query: { appointmentRemindersTable: { findMany: vi.fn().mockResolvedValue([]) } },
    delete: () => ({ where: vi.fn() }),
  },
}));

const reminder = {
  appointmentId: "appt-1",
  clinicId: "clinic-1",
  runAt: new Date(Date.now() + 60_000),
  to: "5511999998888",
  patientName: "Maria",
  doctorName: "Dr. João",
  scheduledAt: new Date(Date.now() + 3_600_000),
};

describe("QStashReminderScheduler", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ messageId: "msg-1" }),
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("publica o destino CRU na URL (sem encodeURIComponent) — QStash rejeita se vier escapado", async () => {
    const scheduler = new QStashReminderScheduler({
      token: "token",
      destinationUrl: "https://m-agendy.vercel.app/api/reminders/dispatch",
    });

    await scheduler.schedule(reminder);

    const [calledUrl] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe(
      "https://qstash.upstash.io/v2/publish/https://m-agendy.vercel.app/api/reminders/dispatch",
    );
  });

  it("usa o endpoint regional quando qstashUrl é configurado", async () => {
    const scheduler = new QStashReminderScheduler({
      token: "token",
      destinationUrl: "https://m-agendy.vercel.app/api/reminders/dispatch",
      qstashUrl: "https://qstash-us-east-1.upstash.io/v2/publish",
    });

    await scheduler.schedule(reminder);

    const [calledUrl] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe(
      "https://qstash-us-east-1.upstash.io/v2/publish/https://m-agendy.vercel.app/api/reminders/dispatch",
    );
  });

  it("lança erro com o corpo da resposta quando o QStash recusa o agendamento", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => '{"error":"invalid destination url"}',
    });
    const scheduler = new QStashReminderScheduler({
      token: "token",
      destinationUrl: "https://m-agendy.vercel.app/api/reminders/dispatch",
    });

    await expect(scheduler.schedule(reminder)).rejects.toThrow(
      'Falha ao agendar lembrete no QStash: 400 — {"error":"invalid destination url"}',
    );
  });

  it("modo dev: sem token, apenas loga e não chama a API", async () => {
    const scheduler = new QStashReminderScheduler({});

    await scheduler.schedule(reminder);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
