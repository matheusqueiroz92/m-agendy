-- =============================================================================
-- Aplicação SEGURA do Prontuário Eletrônico (M.Agendy)
-- -----------------------------------------------------------------------------
-- Este script cria APENAS as estruturas novas do prontuário, de forma
-- idempotente (pode rodar mais de uma vez sem erro). Ele NÃO executa as
-- mudanças não relacionadas que o `drizzle-kit generate` detectou:
--   - DROP COLUMN "users"."phone_number"
--   - ALTER "patients"."phone_number" SET NOT NULL
-- Se você quiser também essas mudanças, aplique-as separadamente e com cuidado.
--
-- Como usar: cole no SQL Editor do Neon (ou rode via psql) e execute.
-- =============================================================================

-- Enums --------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "public"."diagnosis_status" AS ENUM('active', 'resolved', 'chronic');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."follow_up_status" AS ENUM('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Prontuário base (antecedentes) -------------------------------------------
CREATE TABLE IF NOT EXISTS "medical_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL REFERENCES "public"."clinics"("id") ON DELETE cascade,
  "patient_id" uuid NOT NULL UNIQUE REFERENCES "public"."patients"("id") ON DELETE cascade,
  "blood_type" text,
  "allergies" text,
  "medications_in_use" text,
  "clinical_history" text,
  "surgical_history" text,
  "family_history" text,
  "habits" text,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

-- Atendimentos clínicos -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "clinical_attendances" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL REFERENCES "public"."clinics"("id") ON DELETE cascade,
  "patient_id" uuid NOT NULL REFERENCES "public"."patients"("id") ON DELETE cascade,
  "doctor_id" uuid REFERENCES "public"."doctors"("id") ON DELETE set null,
  "appointment_id" uuid REFERENCES "public"."appointments"("id") ON DELETE set null,
  "date" timestamp DEFAULT now() NOT NULL,
  "chief_complaint" text,
  "history_of_present_illness" text,
  "physical_exam" text,
  "conduct" text,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

-- Diagnósticos --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "diagnoses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL REFERENCES "public"."clinics"("id") ON DELETE cascade,
  "patient_id" uuid NOT NULL REFERENCES "public"."patients"("id") ON DELETE cascade,
  "attendance_id" uuid REFERENCES "public"."clinical_attendances"("id") ON DELETE set null,
  "description" text NOT NULL,
  "cid10_code" text,
  "status" "diagnosis_status" DEFAULT 'active' NOT NULL,
  "date" timestamp DEFAULT now() NOT NULL,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

-- Prescrições ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "prescriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL REFERENCES "public"."clinics"("id") ON DELETE cascade,
  "patient_id" uuid NOT NULL REFERENCES "public"."patients"("id") ON DELETE cascade,
  "doctor_id" uuid REFERENCES "public"."doctors"("id") ON DELETE set null,
  "attendance_id" uuid REFERENCES "public"."clinical_attendances"("id") ON DELETE set null,
  "medication" text NOT NULL,
  "dosage" text,
  "frequency" text,
  "duration" text,
  "instructions" text,
  "date" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

-- Acompanhamentos -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "follow_ups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL REFERENCES "public"."clinics"("id") ON DELETE cascade,
  "patient_id" uuid NOT NULL REFERENCES "public"."patients"("id") ON DELETE cascade,
  "title" text NOT NULL,
  "description" text,
  "status" "follow_up_status" DEFAULT 'pending' NOT NULL,
  "scheduled_date" timestamp,
  "completed_date" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);
