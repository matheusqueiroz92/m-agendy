-- Fase 9: teste grátis sem cartão (trial) + cancelamento real de lembretes no QStash.
-- Idempotente e seguro para linhas existentes. Aplicar no SQL Editor do Neon.

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "plan_expires_at" timestamp;
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "has_used_trial" boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "appointment_reminders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "appointment_id" uuid NOT NULL REFERENCES "appointments"("id") ON DELETE CASCADE,
  "qstash_message_id" text NOT NULL,
  "run_at" timestamp NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "appointment_reminders_appointment_id_idx"
  ON "appointment_reminders" ("appointment_id");
