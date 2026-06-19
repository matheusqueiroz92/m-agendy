-- Fase 8: administração da plataforma — status e override de plano por clínica.
-- Idempotente e seguro para linhas existentes. Aplicar no SQL Editor do Neon.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clinic_status') THEN
    CREATE TYPE "clinic_status" AS ENUM ('active', 'blocked');
  END IF;
END $$;

ALTER TABLE "clinics"
  ADD COLUMN IF NOT EXISTS "status" "clinic_status" NOT NULL DEFAULT 'active';
ALTER TABLE "clinics"
  ADD COLUMN IF NOT EXISTS "blocked_reason" text;
ALTER TABLE "clinics"
  ADD COLUMN IF NOT EXISTS "plan_override" text;
ALTER TABLE "clinics"
  ADD COLUMN IF NOT EXISTS "plan_override_expires_at" timestamp;
