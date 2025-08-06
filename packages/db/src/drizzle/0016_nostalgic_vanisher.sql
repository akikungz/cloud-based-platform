CREATE TABLE "ssh_public_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" text NOT NULL,
	"key" text NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "ssh_public_keys" ADD CONSTRAINT "ssh_public_keys_auth_id_user_id_fk" FOREIGN KEY ("auth_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;