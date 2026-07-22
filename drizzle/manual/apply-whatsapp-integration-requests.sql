-- =============================================================================
-- Solicitações de integração de WhatsApp próprio (M.Agendy)
-- -----------------------------------------------------------------------------
-- Idempotente. Cria:
--   - enum whatsapp_integration_request_status ('pending', 'completed')
--   - tabela whatsapp_integration_requests
--
-- Fluxo: a clínica (planos Premium/Gold) solicita a integração do próprio
-- número de WhatsApp; a equipe do M.Agendy configura manualmente no Meta
-- Business Manager e conclui a solicitação gravando o phone_number_id obtido
-- (tela admin da plataforma). Sem etapa intermediária de "em andamento".
--
-- Cole no SQL Editor do Neon e execute (RUN).
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE "public"."whatsapp_integration_request_status" AS ENUM(
    'pending', 'completed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "whatsapp_integration_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL REFERENCES "public"."clinics"("id") ON DELETE cascade,
  "status" "whatsapp_integration_request_status" DEFAULT 'pending' NOT NULL,
  "phone_number_id" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "completed_at" timestamp
);
