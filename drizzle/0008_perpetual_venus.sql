CREATE TYPE "public"."clinic_status" AS ENUM('active', 'blocked');--> statement-breakpoint
CREATE TABLE "appointment_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"qstash_message_id" text NOT NULL,
	"run_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "status" "clinic_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "blocked_reason" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "plan_override" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "plan_override_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "whatsapp_phone_number_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "has_used_trial" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "appointment_reminders" ADD CONSTRAINT "appointment_reminders_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_whatsapp_phone_number_id_unique" UNIQUE("whatsapp_phone_number_id");