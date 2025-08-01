CREATE TYPE "public"."instance_request_type" AS ENUM('course', 'project');--> statement-breakpoint
CREATE TYPE "public"."instance_state" AS ENUM('active', 'deleted', 'archived');--> statement-breakpoint
CREATE TYPE "public"."instance_status" AS ENUM('pending', 'running', 'stopped');--> statement-breakpoint
CREATE TYPE "public"."node_status" AS ENUM('online', 'offline', 'maintenance', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."request_state" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."vm_type" AS ENUM('qemu', 'lxc');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "staff_list" (
	"id" text PRIMARY KEY NOT NULL,
	"auth_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instance" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" "instance_request_type" NOT NULL,
	"course" text NOT NULL,
	"samester" text,
	"template" text NOT NULL,
	"cpus" integer NOT NULL,
	"memory" integer NOT NULL,
	"disk" integer NOT NULL,
	"state" "instance_state" DEFAULT 'active' NOT NULL,
	"status" "instance_status" DEFAULT 'pending' NOT NULL,
	"pve_node_id" text,
	"vm_id" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instance_course" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"course_title" text NOT NULL,
	"course_staff" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instance_request" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" "instance_request_type" NOT NULL,
	"course" text NOT NULL,
	"template" text NOT NULL,
	"cpus" integer NOT NULL,
	"memory" integer NOT NULL,
	"disk" integer NOT NULL,
	"state" "request_state" DEFAULT 'pending' NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "instance_request_extends" (
	"id" text PRIMARY KEY NOT NULL,
	"instance_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"state" "request_state" DEFAULT 'pending' NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "instance_template" (
	"id" text PRIMARY KEY NOT NULL,
	"os_name" text NOT NULL,
	"vm_template_id" text NOT NULL,
	"vm_template_host" text NOT NULL,
	"vm_type" "vm_type" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pve_node" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" "node_status" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "samester" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_at" timestamp NOT NULL,
	"end_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_list" ADD CONSTRAINT "staff_list_auth_id_user_id_fk" FOREIGN KEY ("auth_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance" ADD CONSTRAINT "instance_course_instance_course_id_fk" FOREIGN KEY ("course") REFERENCES "public"."instance_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance" ADD CONSTRAINT "instance_samester_samester_id_fk" FOREIGN KEY ("samester") REFERENCES "public"."samester"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance" ADD CONSTRAINT "instance_template_instance_template_id_fk" FOREIGN KEY ("template") REFERENCES "public"."instance_template"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance" ADD CONSTRAINT "instance_pve_node_id_pve_node_id_fk" FOREIGN KEY ("pve_node_id") REFERENCES "public"."pve_node"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_request" ADD CONSTRAINT "instance_request_course_instance_course_id_fk" FOREIGN KEY ("course") REFERENCES "public"."instance_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_request" ADD CONSTRAINT "instance_request_template_instance_template_id_fk" FOREIGN KEY ("template") REFERENCES "public"."instance_template"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_request_extends" ADD CONSTRAINT "instance_request_extends_instance_id_instance_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."instance"("id") ON DELETE cascade ON UPDATE no action;