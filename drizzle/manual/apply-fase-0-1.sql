-- =============================================================================
-- Aplicação SEGURA da Fase 0/1 (M.Agendy) — papéis, auditoria e multi-tenancy
-- -----------------------------------------------------------------------------
-- Equivale à migração 0003, em formato idempotente (pode rodar mais de uma vez
-- sem erro). Cria:
--   - enums user_platform_role e clinic_role
--   - coluna users.platform_role (default 'member')
--   - coluna users_to_clinics.role (default 'owner')
--   - tabela audit_logs
--
-- Como usar: cole no SQL Editor do Neon e execute (RUN). Depois, promova seu
-- usuário a admin (ver final do arquivo).
-- =============================================================================

-- Enums --------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "public"."user_platform_role" AS ENUM('platform_admin', 'member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."clinic_role" AS ENUM('owner', 'manager', 'professional', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Colunas de papéis --------------------------------------------------------
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "platform_role" "user_platform_role" DEFAULT 'member' NOT NULL;

ALTER TABLE "users_to_clinics"
  ADD COLUMN IF NOT EXISTS "role" "clinic_role" DEFAULT 'owner' NOT NULL;

-- Tabela de auditoria ------------------------------------------------------
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid REFERENCES "public"."clinics"("id") ON DELETE set null,
  "actor_user_id" text REFERENCES "public"."users"("id") ON DELETE set null,
  "action" text NOT NULL,
  "entity_type" text,
  "entity_id" text,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- =============================================================================
-- Depois de rodar o bloco acima com sucesso, promova seu usuário a admin:
--
--   UPDATE users SET platform_role = 'platform_admin'
--   WHERE email = 'gigamatheus@gmail.com';
--
-- E confira:
--   SELECT email, platform_role FROM users WHERE email = 'gigamatheus@gmail.com';
-- =============================================================================
