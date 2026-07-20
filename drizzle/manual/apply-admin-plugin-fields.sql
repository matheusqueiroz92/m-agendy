-- Correção: plugin "admin" do BetterAuth (better-auth/plugins) exige as
-- colunas role/banned/ban_reason/ban_expires em "users" (usadas internamente
-- por auth.api.createUser, chamado pelo ClinicOwnerProvisioner ao criar uma
-- clínica pelo admin). Sem elas, a criação de clínica falha com:
--   BetterAuthError: The field "role" does not exist in the "usersTable" schema.
--
-- Também restaura "phone_number" em "users" (removido acidentalmente na
-- migração 0002 e nunca mais usado desde então — ver update-settings e o
-- ClinicOwnerProvisioner, que já esperavam essa coluna).
--
-- Idempotente e seguro para linhas existentes (todas as colunas anuláveis ou
-- com default). Aplicar no SQL Editor do Neon.

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "role" text,
  ADD COLUMN IF NOT EXISTS "banned" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "ban_reason" text,
  ADD COLUMN IF NOT EXISTS "ban_expires" timestamp,
  ADD COLUMN IF NOT EXISTS "phone_number" text;
