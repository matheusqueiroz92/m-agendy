import { SystemClock } from "@/core/shared/infra/system-clock";

import { HandleChatbotMessageUseCase } from "../../application/use-cases/handle-chatbot-message";
import {
  DrizzleChatAvailability,
  DrizzleChatPatientLookup,
  DrizzleChatProfessionalsCatalog,
} from "../chatbot/drizzle-chat-directories";
import { DrizzleChatClinicResolver } from "../chatbot/drizzle-chat-clinic-resolver";
import { DrizzleChatScheduler } from "../chatbot/drizzle-chat-scheduler";
import { DrizzleConversationStore } from "../chatbot/drizzle-conversation-store";
import { HttpWhatsAppMessenger } from "../messaging/whatsapp-messenger";

/** Composition root do chatbot de agendamento via WhatsApp. */
export const makeHandleChatbotMessage = () =>
  new HandleChatbotMessageUseCase(
    new DrizzleConversationStore(),
    new DrizzleChatClinicResolver(),
    new DrizzleChatPatientLookup(),
    new DrizzleChatProfessionalsCatalog(),
    new DrizzleChatAvailability(),
    new DrizzleChatScheduler(),
    new HttpWhatsAppMessenger({
      apiUrl: process.env.WHATSAPP_API_URL,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    }),
    new SystemClock(),
  );
