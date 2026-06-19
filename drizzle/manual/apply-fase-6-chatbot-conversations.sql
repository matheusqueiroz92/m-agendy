-- =============================================================================
-- Fase 6 (chatbot) — Conversas do WhatsApp (M.Agendy)
-- -----------------------------------------------------------------------------
-- Equivale à migração 0007, idempotente. Cria a tabela que guarda o estado da
-- conversa de agendamento por telefone.
-- Cole no SQL Editor do Neon e execute (RUN).
-- =============================================================================

CREATE TABLE IF NOT EXISTS "whatsapp_conversations" (
  "phone" text PRIMARY KEY NOT NULL,
  "clinic_id" uuid NOT NULL REFERENCES "public"."clinics"("id") ON DELETE cascade,
  "step" text NOT NULL,
  "data" jsonb,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
