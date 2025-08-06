ALTER TABLE "ip_address" ADD COLUMN "is_used" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "network" DROP COLUMN "is_used";