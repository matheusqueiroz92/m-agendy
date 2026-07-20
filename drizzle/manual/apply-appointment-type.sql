-- Feature: campo "tipo" do agendamento (consulta ou retorno).
-- Idempotente e seguro para linhas existentes (default "consultation").
-- Aplicar no SQL Editor do Neon.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'appointment_type'
  ) THEN
    CREATE TYPE "appointment_type" AS ENUM ('consultation', 'return_visit');
  END IF;
END $$;

ALTER TABLE "appointments"
  ADD COLUMN IF NOT EXISTS "type" "appointment_type" NOT NULL DEFAULT 'consultation';
