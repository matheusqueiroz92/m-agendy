import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FakeClinicWhatsAppDirectory } from "../../application/testing/fakes";
import { WhatsAppAppointmentNotifier } from "./whatsapp-appointment-notifier";

const notification = {
  clinicId: "clinic-1",
  to: "5511999998888",
  patientName: "Maria",
  doctorName: "Dr. João",
  scheduledAt: new Date("2026-07-20T14:00:00.000Z"),
};

// A formatação usa o fuso horário local da máquina (mesmo comportamento do
// adapter em produção) — computar aqui em vez de fixar uma string evita que
// o teste quebre dependendo do timezone de quem/onde ele roda.
const WHEN_FORMATTED = dayjs(notification.scheduledAt).format("DD/MM/YYYY [às] HH:mm");

describe("WhatsAppAppointmentNotifier", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    consoleInfoSpy.mockRestore();
  });

  it("modo dev: sem credenciais, apenas loga e não chama a Graph API", async () => {
    const notifier = new WhatsAppAppointmentNotifier();

    await notifier.notifyScheduled(notification);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining("[whatsapp:dev] confirmação"));
  });

  it("modo dev: com credenciais mas sem o nome do template, também não chama a Graph API", async () => {
    const notifier = new WhatsAppAppointmentNotifier({
      apiUrl: "https://graph.facebook.com/v20.0",
      phoneNumberId: "123",
      accessToken: "token",
      // confirmationTemplateName ausente de propósito
    });

    await notifier.notifyScheduled(notification);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      expect.stringContaining("(não configurado)"),
    );
  });

  it("envia template de confirmação com os parâmetros posicionais corretos", async () => {
    const notifier = new WhatsAppAppointmentNotifier({
      apiUrl: "https://graph.facebook.com/v20.0",
      phoneNumberId: "123",
      accessToken: "token",
      confirmationTemplateName: "confirmacao_agendamento",
      reminderTemplateName: "lembrete_agendamento",
      templateLanguage: "pt_BR",
    });

    await notifier.notifyScheduled(notification);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://graph.facebook.com/v20.0/123/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer token" }),
      }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({
      messaging_product: "whatsapp",
      to: "5511999998888",
      type: "template",
      template: {
        name: "confirmacao_agendamento",
        language: { code: "pt_BR" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "Maria" },
              { type: "text", text: "Dr. João" },
              { type: "text", text: WHEN_FORMATTED },
            ],
          },
        ],
      },
    });
  });

  it("envia template de lembrete usando reminderTemplateName", async () => {
    const notifier = new WhatsAppAppointmentNotifier({
      apiUrl: "https://graph.facebook.com/v20.0",
      phoneNumberId: "123",
      accessToken: "token",
      confirmationTemplateName: "confirmacao_agendamento",
      reminderTemplateName: "lembrete_agendamento",
    });

    await notifier.notifyReminder(notification);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.template.name).toBe("lembrete_agendamento");
  });

  it("envia template de cancelamento usando cancellationTemplateName", async () => {
    const notifier = new WhatsAppAppointmentNotifier({
      apiUrl: "https://graph.facebook.com/v20.0",
      phoneNumberId: "123",
      accessToken: "token",
      cancellationTemplateName: "cancelamento_agendamento",
    });

    await notifier.notifyCancelled(notification);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.template.name).toBe("cancelamento_agendamento");
  });

  it("normaliza o telefone do paciente com o DDI 55 quando ele vem sem código do país", async () => {
    // É assim que o telefone é cadastrado hoje (formulário só pede DDD +
    // número) — sem essa normalização, a Meta rejeita o destinatário.
    const notifier = new WhatsAppAppointmentNotifier({
      apiUrl: "https://graph.facebook.com/v20.0",
      phoneNumberId: "123",
      accessToken: "token",
      confirmationTemplateName: "confirmacao_agendamento",
    });

    await notifier.notifyScheduled({ ...notification, to: "(11) 99999-8888" });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.to).toBe("5511999998888");
  });

  it("usa valores de fallback quando patientName/doctorName vêm vazios", async () => {
    const notifier = new WhatsAppAppointmentNotifier({
      apiUrl: "https://graph.facebook.com/v20.0",
      phoneNumberId: "123",
      accessToken: "token",
      confirmationTemplateName: "confirmacao_agendamento",
    });

    await notifier.notifyScheduled({ ...notification, patientName: "  ", doctorName: undefined });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.template.components[0].parameters).toEqual([
      { type: "text", text: "paciente" },
      { type: "text", text: "seu profissional" },
      { type: "text", text: WHEN_FORMATTED },
    ]);
  });

  it("lança erro quando a Graph API responde com falha", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401 });
    const notifier = new WhatsAppAppointmentNotifier({
      apiUrl: "https://graph.facebook.com/v20.0",
      phoneNumberId: "123",
      accessToken: "token",
      confirmationTemplateName: "confirmacao_agendamento",
    });

    await expect(notifier.notifyScheduled(notification)).rejects.toThrow(
      "Falha ao enviar template no WhatsApp: 401",
    );
  });

  it("usa o número próprio da clínica quando o directory tem um cadastrado", async () => {
    const directory = new FakeClinicWhatsAppDirectory();
    directory.set("clinic-1", "999888777");
    const notifier = new WhatsAppAppointmentNotifier(
      {
        apiUrl: "https://graph.facebook.com/v20.0",
        phoneNumberId: "123", // fallback compartilhado — não deve ser usado aqui
        accessToken: "token",
        confirmationTemplateName: "confirmacao_agendamento",
      },
      directory,
    );

    await notifier.notifyScheduled(notification);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://graph.facebook.com/v20.0/999888777/messages",
      expect.anything(),
    );
  });

  it("cai no número compartilhado (fallback) quando a clínica não tem número próprio", async () => {
    const directory = new FakeClinicWhatsAppDirectory();
    // Nenhum número cadastrado para "clinic-1".
    const notifier = new WhatsAppAppointmentNotifier(
      {
        apiUrl: "https://graph.facebook.com/v20.0",
        phoneNumberId: "123",
        accessToken: "token",
        confirmationTemplateName: "confirmacao_agendamento",
      },
      directory,
    );

    await notifier.notifyScheduled(notification);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://graph.facebook.com/v20.0/123/messages",
      expect.anything(),
    );
  });
});
