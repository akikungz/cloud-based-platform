CREATE TYPE "public"."staff_role" AS ENUM('Administrator', 'Teacher', 'Staff');--> statement-breakpoint
ALTER TABLE "staff_list" ADD COLUMN "role" "staff_role" DEFAULT 'Staff' NOT NULL;