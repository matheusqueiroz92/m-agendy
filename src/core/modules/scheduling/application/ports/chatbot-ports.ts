import { ChatbotData, ChatbotOption, ChatbotStep } from "../../domain/chatbot";

export interface StoredConversation {
  clinicId: string;
  step: ChatbotStep;
  data: ChatbotData;
}

/** Persistência do estado da conversa por telefone. */
export interface ConversationStore {
  get(phone: string): Promise<StoredConversation | null>;
  save(phone: string, conversation: StoredConversation): Promise<void>;
  clear(phone: string): Promise<void>;
}

/** Lista de profissionais da clínica para escolha no chat. */
export interface ChatProfessionalsCatalog {
  listByClinic(clinicId: string): Promise<ChatbotOption[]>;
}

/** Identifica o paciente já cadastrado a partir do telefone. */
export interface ChatPatientLookup {
  findByPhone(params: {
    clinicId: string;
    phone: string;
  }): Promise<{ patientId: string; name: string } | null>;
}

/** Horários livres "HH:MM" de um profissional numa data. */
export interface ChatAvailability {
  listFreeTimes(params: {
    clinicId: string;
    doctorId: string;
    dateISO: string;
  }): Promise<string[]>;
}

/** Resultado do agendamento: efetivado ou horário tomado por outra pessoa. */
export type ChatBookingResult = "booked" | "conflict";

/** Efetiva o agendamento (reaproveita o caso de uso de agendamento). */
export interface ChatScheduler {
  book(params: {
    clinicId: string;
    patientId: string;
    doctorId: string;
    scheduledAt: Date;
  }): Promise<ChatBookingResult>;
}

/** Envio de mensagens de saída no WhatsApp. */
export interface WhatsAppMessenger {
  /** `clinicId` resolve o número de envio (o da clínica, com fallback pro
   * compartilhado); omitido quando a clínica ainda não foi identificada. */
  sendText(params: { to: string; body: string; clinicId?: string }): Promise<void>;
}

/** Resolve a clínica dona do número que recebeu a mensagem. */
export interface ChatClinicResolver {
  resolveInboundClinicId(params: {
    /** ID do número (phone_number_id) que recebeu a mensagem, quando disponível. */
    phoneNumberId?: string | null;
  }): Promise<string | null>;
}
