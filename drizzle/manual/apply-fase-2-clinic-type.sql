-- =============================================================================
-- Fase 2 (cont.) — Tipo de clínica (M.Agendy)
-- -----------------------------------------------------------------------------
-- Equivale à migração 0004, em formato idempotente. Cria:
--   - enum clinic_type
--   - coluna clinics.type (default 'medical')
--
-- Clínicas já existentes ficam como 'medical' (mantém os rótulos atuais).
-- Cole no SQL Editor do Neon e execute (RUN).
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE "public"."clinic_type" AS ENUM(
    'medical', 'dental', 'physiotherapy', 'nutrition', 'psychology', 'multidisciplinary'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "clinics"
  ADD COLUMN IF NOT EXISTS "type" "clinic_type" DEFAULT 'medical' NOT NULL;
