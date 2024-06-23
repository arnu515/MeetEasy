ALTER TABLE "meetings" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "meetings" ALTER COLUMN "duration" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "scheduled_at" timestamp with time zone NOT NULL;