-- =============================================================================
-- Fase 6 — Status do agendamento + Notificações (M.Agendy)
-- -----------------------------------------------------------------------------
-- Equivale à migração 0006, idempotente. Cria:
--   - enum appointment_status + coluna appointments.status (default 'pending')
--   - tabela notifications (avisos in-app para a clínica)
--
-- Observação: agendamentos já existentes ficam como 'pending'. Se quiser marcar
-- os antigos como confirmados, rode depois:
--   UPDATE appointments SET status = 'confirmed' WHERE created_at < now();
--
-- Cole no SQL Editor do Neon e execute (RUN).
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE "public"."appointment_status" AS ENUM(
    'pending', 'confirmed', 'cancelled', 'no_show'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "appointments"
  ADD COLUMN IF NOT EXISTS "status" "appointment_status" DEFAULT 'pending' NOT NULL;

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL REFERENCES "public"."clinics"("id") ON DELETE cascade,
  "type" text NOT NULL,
  "title" text NOT NULL,
  "appointment_id" uuid REFERENCES "public"."appointments"("id") ON DELETE set null,
  "read_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
