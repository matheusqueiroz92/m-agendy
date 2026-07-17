import { ChatbotOption } from "../../domain/chatbot";
import {
  ChatAvailability,
  ChatBookingResult,
  ChatClinicResolver,
  ChatPatientLookup,
  ChatProfessionalsCatalog,
  ChatScheduler,
  ConversationStore,
  StoredConversation,
  WhatsAppMessenger,
} from "../ports/chatbot-ports";

export class InMemoryConversationStore implements ConversationStore {
  public map = new Map<string, StoredConversation>();
  async get(phone: string) {
    return this.map.get(phone) ?? null;
  }
  async save(phone: string, conversation: StoredConversation) {
    this.map.set(phone, conversation);
  }
  async clear(phone: string) {
    this.map.delete(phone);
  }
}

export class FakeChatClinicResolver implements ChatClinicResolver {
  constructor(private readonly clinicId: string | null) {}
  async resolveInboundClinicId(_params: { phoneNumberId?: string | null }) {
    void _params;
    return this.clinicId;
  }
}

export class FakeChatPatientLookup implements ChatPatientLookup {
  public byPhone = new Map<string, { patientId: string; name: string }>();
  async findByPhone(params: { clinicId: string; phone: string }) {
    return this.byPhone.get(params.phone) ?? null;
  }
}

export class FakeChatProfessionalsCatalog implements ChatProfessionalsCatalog {
  constructor(public options: ChatbotOption[] = []) {}
  async listByClinic() {
    return this.options;
  }
}

export class FakeChatAvailability implements ChatAvailability {
  constructor(public times: string[] = []) {}
  async listFreeTimes() {
    return this.times;
  }
}

export class FakeChatScheduler implements ChatScheduler {
  public booked: {
    clinicId: string;
    patientId: string;
    doctorId: string;
    scheduledAt: Date;
  }[] = [];
  /** Quando true, a próxima reserva retorna "conflict" (simula corrida). */
  public nextIsConflict = false;
  async book(params: {
    clinicId: string;
    patientId: string;
    doctorId: string;
    scheduledAt: Date;
  }): Promise<ChatBookingResult> {
    if (this.nextIsConflict) {
      this.nextIsConflict = false;
      return "conflict";
    }
    this.booked.push(params);
    return "booked";
  }
}

export class FakeWhatsAppMessenger implements WhatsAppMessenger {
  public sent: { to: string; body: string; clinicId?: string }[] = [];
  async sendText(params: { to: string; body: string; clinicId?: string }) {
    this.sent.push(params);
  }
  last() {
    return this.sent[this.sent.length - 1]?.body ?? "";
  }
}
