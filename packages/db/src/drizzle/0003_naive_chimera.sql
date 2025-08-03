ALTER TABLE "instance_request_extends" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "instance_request_extends" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "instance_request_extends" ALTER COLUMN "updated_at" SET DEFAULT now();