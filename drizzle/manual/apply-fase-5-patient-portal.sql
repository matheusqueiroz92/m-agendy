-- =============================================================================
-- Fase 5 — Portal do Paciente (M.Agendy)
-- -----------------------------------------------------------------------------
-- Equivale à migração 0005, idempotente. Adiciona a coluna patients.user_id,
-- que vincula a conta (BetterAuth) ao registro do paciente.
-- Cole no SQL Editor do Neon e execute (RUN).
-- =============================================================================

ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "user_id" text;

DO $$ BEGIN
  ALTER TABLE "patients"
    ADD CONSTRAINT "patients_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
