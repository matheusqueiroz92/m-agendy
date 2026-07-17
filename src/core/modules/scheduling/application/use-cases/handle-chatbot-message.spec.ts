import { beforeEach, describe, expect, it } from "vitest";

import {
  FakeChatAvailability,
  FakeChatClinicResolver,
  FakeChatPatientLookup,
  FakeChatProfessionalsCatalog,
  FakeChatScheduler,
  FakeWhatsAppMessenger,
  InMemoryConversationStore,
} from "../testing/chatbot-fakes";
import { FixedClock } from "../testing/fakes";
import { HandleChatbotMessageUseCase } from "./handle-chatbot-message";

describe("HandleChatbotMessageUseCase", () => {
  const now = new Date("2026-06-15T12:00:00.000Z");
  const phone = "+5511999999999";

  let store: InMemoryConversationStore;
  let patients: FakeChatPatientLookup;
  let catalog: FakeChatProfessionalsCatalog;
  let availability: FakeChatAvailability;
  let scheduler: FakeChatScheduler;
  let messenger: FakeWhatsAppMessenger;
  let useCase: HandleChatbotMessageUseCase;

  const build = () =>
    new HandleChatbotMessageUseCase(
      store,
      new FakeChatClinicResolver("clinic-1"),
      patients,
      catalog,
      availability,
      scheduler,
      messenger,
      new FixedClock(now),
    );

  beforeEach(() => {
    store = new InMemoryConversationStore();
    patients = new FakeChatPatientLookup();
    patients.byPhone.set(phone, { patientId: "patient-1", name: "Maria" });
    catalog = new FakeChatProfessionalsCatalog([
      { id: "doctor-1", label: "Dr. House · Clínico" },
      { id: "doctor-2", label: "Dra. Ana · Pediatria" },
    ]);
    availability = new FakeChatAvailability(["08:00", "08:30"]);
    scheduler = new FakeChatScheduler();
    messenger = new FakeWhatsAppMessenger();
    useCase = build();
  });

  it("telefone desconhecido recebe orientação de link", async () => {
    patients.byPhone.clear();
    await useCase.execute({ fromPhone: phone, text: "oi" });
    expect(messenger.last().toLowerCase()).toContain("cadastro");
    expect(store.map.size).toBe(0);
  });

  it("envia as respostas com o clinicId resolvido (roteamento multi-tenant do número de envio)", async () => {
    await useCase.execute({ fromPhone: phone, text: "oi" });
    expect(messenger.sent[0].clinicId).toBe("clinic-1");
  });

  it("fluxo completo: profissional → data → horário → agendado", async () => {
    await useCase.execute({ fromPhone: phone, text: "oi" });
    expect(messenger.last()).toContain("1. Dr. House");

    await useCase.execute({ fromPhone: phone, text: "1" });
    expect(messenger.last()).toContain("DD/MM/AAAA");

    await useCase.execute({ fromPhone: phone, text: "20/06/2026" });
    expect(messenger.last()).toContain("1. 08:00");

    await useCase.execute({ fromPhone: phone, text: "1" });

    expect(scheduler.booked).toHaveLength(1);
    expect(scheduler.booked[0].doctorId).toBe("doctor-1");
    expect(scheduler.booked[0].patientId).toBe("patient-1");
    expect(scheduler.booked[0].scheduledAt.getHours()).toBe(8);
    expect(messenger.last()).toContain("agendada");
    expect(store.map.size).toBe(0);
  });

  it("data sem horários pede outra data", async () => {
    availability.times = [];
    await useCase.execute({ fromPhone: phone, text: "oi" });
    await useCase.execute({ fromPhone: phone, text: "1" });
    await useCase.execute({ fromPhone: phone, text: "20/06/2026" });
    expect(messenger.last().toLowerCase()).toContain("outra data");
    expect(scheduler.booked).toHaveLength(0);
  });

  it("corrida: horário tomado re-oferece os horários restantes", async () => {
    await useCase.execute({ fromPhone: phone, text: "oi" });
    await useCase.execute({ fromPhone: phone, text: "1" });
    await useCase.execute({ fromPhone: phone, text: "20/06/2026" });

    scheduler.nextIsConflict = true;
    availability.times = ["08:30"];

    await useCase.execute({ fromPhone: phone, text: "1" });

    expect(scheduler.booked).toHaveLength(0);
    expect(messenger.last().toLowerCase()).toContain("preenchido");
    expect(messenger.last()).toContain("1. 08:30");
    expect(store.map.get(phone)?.step).toBe("choosing_time");

    await useCase.execute({ fromPhone: phone, text: "1" });
    expect(scheduler.booked).toHaveLength(1);
    expect(messenger.last()).toContain("agendada");
  });

  it("corrida sem horários restantes pede outra data", async () => {
    await useCase.execute({ fromPhone: phone, text: "oi" });
    await useCase.execute({ fromPhone: phone, text: "1" });
    await useCase.execute({ fromPhone: phone, text: "20/06/2026" });

    scheduler.nextIsConflict = true;
    availability.times = [];

    await useCase.execute({ fromPhone: phone, text: "1" });

    expect(scheduler.booked).toHaveLength(0);
    expect(messenger.last().toLowerCase()).toContain("outra data");
    expect(store.map.get(phone)?.step).toBe("choosing_date");
  });

  it("'cancelar' encerra a conversa", async () => {
    await useCase.execute({ fromPhone: phone, text: "oi" });
    await useCase.execute({ fromPhone: phone, text: "cancelar" });
    expect(store.map.size).toBe(0);
    expect(messenger.last().toLowerCase()).toContain("cancelado");
  });

  it("escolha inválida re-pergunta", async () => {
    await useCase.execute({ fromPhone: phone, text: "oi" });
    await useCase.execute({ fromPhone: phone, text: "9" });
    expect(messenger.last().toLowerCase()).toContain("número do profissional");
    expect(scheduler.booked).toHaveLength(0);
  });
});
