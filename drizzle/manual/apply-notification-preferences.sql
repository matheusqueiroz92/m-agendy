-- =============================================================================
-- Preferências reais de notificação (M.Agendy)
-- -----------------------------------------------------------------------------
-- Idempotente. Adiciona:
--   - clinics.appointment_reminders_enabled (default true)
--   - users.marketing_emails_opt_in (default false)
--
-- Contexto: os toggles "Lembretes de Agendamento" e "Emails de Marketing" em
-- Configurações não tinham nenhum efeito real (o valor era descartado no
-- server, nunca persistido). Esta migração cria as colunas para que passem a
-- gravar/ler de verdade.
--
-- Cole no SQL Editor do Neon e execute (RUN).
-- =============================================================================

ALTER TABLE "clinics"
  ADD COLUMN IF NOT EXISTS "appointment_reminders_enabled" boolean DEFAULT true NOT NULL;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "marketing_emails_opt_in" boolean DEFAULT false NOT NULL;
