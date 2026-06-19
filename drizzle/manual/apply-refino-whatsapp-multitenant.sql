-- Refino: roteamento multi-tenant do WhatsApp.
-- Adiciona o phone_number_id (Meta) por clínica. Idempotente e seguro para
-- linhas existentes (coluna anulável). Aplicar no SQL Editor do Neon.

ALTER TABLE "clinics"
  ADD COLUMN IF NOT EXISTS "whatsapp_phone_number_id" text;

-- Unicidade do número entre clínicas (evita duas clínicas com o mesmo número).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'clinics_whatsapp_phone_number_id_unique'
  ) THEN
    ALTER TABLE "clinics"
      ADD CONSTRAINT "clinics_whatsapp_phone_number_id_unique"
      UNIQUE ("whatsapp_phone_number_id");
  END IF;
END $$;
