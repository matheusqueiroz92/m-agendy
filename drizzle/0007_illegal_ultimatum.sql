CREATE TABLE "whatsapp_conversations" (
	"phone" text PRIMARY KEY NOT NULL,
	"clinic_id" uuid NOT NULL,
	"step" text NOT NULL,
	"data" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;