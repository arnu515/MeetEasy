CREATE TABLE IF NOT EXISTS "meeting_invites" (
	"id" text PRIMARY KEY NOT NULL,
	"message" text,
	"phone" text,
	"email" text,
	"meeting_id" text,
	"inviter_id" text,
	CONSTRAINT "meeting_invites_phone_meeting_id_unique" UNIQUE("phone","meeting_id"),
	CONSTRAINT "meeting_invites_email_meeting_id_unique" UNIQUE("email","meeting_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meetings" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"duration" interval hour to minute,
	"owner_id" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meeting_invites" ADD CONSTRAINT "meeting_invites_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meeting_invites" ADD CONSTRAINT "meeting_invites_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meetings" ADD CONSTRAINT "meetings_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "meetings_title_idx" ON "meetings" USING btree ("title");