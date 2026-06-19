import { eq } from "drizzle-orm";

import { db } from "@/db";
import { whatsappConversationsTable } from "@/db/schema";

import { ChatbotData, ChatbotStep } from "../../domain/chatbot";
import {
  ConversationStore,
  StoredConversation,
} from "../../application/ports/chatbot-ports";

/** Persiste a conversa do chatbot na tabela whatsapp_conversations. */
export class DrizzleConversationStore implements ConversationStore {
  async get(phone: string): Promise<StoredConversation | null> {
    const row = await db.query.whatsappConversationsTable.findFirst({
      where: eq(whatsappConversationsTable.phone, phone),
    });

    if (!row) {
      return null;
    }

    return {
      clinicId: row.clinicId,
      step: row.step as ChatbotStep,
      data: (row.data as ChatbotData | null) ?? {},
    };
  }

  async save(phone: string, conversation: StoredConversation): Promise<void> {
    await db
      .insert(whatsappConversationsTable)
      .values({
        phone,
        clinicId: conversation.clinicId,
        step: conversation.step,
        data: conversation.data,
      })
      .onConflictDoUpdate({
        target: [whatsappConversationsTable.phone],
        set: {
          clinicId: conversation.clinicId,
          step: conversation.step,
          data: conversation.data,
          updatedAt: new Date(),
        },
      });
  }

  async clear(phone: string): Promise<void> {
    await db
      .delete(whatsappConversationsTable)
      .where(eq(whatsappConversationsTable.phone, phone));
  }
}
