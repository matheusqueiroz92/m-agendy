-- Schedule board: duration, availability windows, migrate old doctor range columns
ALTER TABLE "appointments" ADD COLUMN "duration_in_minutes" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "default_appointment_duration_in_minutes" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
CREATE TABLE "doctor_availability_windows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doctor_id" uuid NOT NULL,
	"week_day" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "doctor_availability_windows" ADD CONSTRAINT "doctor_availability_windows_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Backfill: expand contiguous week-day range into one window per day
INSERT INTO "doctor_availability_windows" ("doctor_id", "week_day", "start_time", "end_time")
SELECT
  d."id",
  wd.day,
  d."available_from_time",
  d."available_to_time"
FROM "doctors" d
CROSS JOIN generate_series(0, 6) AS wd(day)
WHERE
  CASE
    WHEN d."available_from_week_day" <= d."available_to_week_day"
      THEN wd.day >= d."available_from_week_day" AND wd.day <= d."available_to_week_day"
    ELSE
      wd.day >= d."available_from_week_day" OR wd.day <= d."available_to_week_day"
  END;--> statement-breakpoint
ALTER TABLE "doctors" DROP COLUMN "available_from_week_day";--> statement-breakpoint
ALTER TABLE "doctors" DROP COLUMN "available_to_week_day";--> statement-breakpoint
ALTER TABLE "doctors" DROP COLUMN "available_from_time";--> statement-breakpoint
ALTER TABLE "doctors" DROP COLUMN "available_to_time";
