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
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_public_key" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"public_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "instance" (
	"id" serial PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"title" text NOT NULL,
	"hostname" text NOT NULL,
	"description" text NOT NULL,
	"type" "instance_request_type" NOT NULL,
	"course" integer NOT NULL,
	"samester" integer,
	"template" integer NOT NULL,
	"cpus" integer NOT NULL,
	"memory" integer NOT NULL,
	"disk" integer NOT NULL,
	"state" "instance_state" DEFAULT 'active' NOT NULL,
	"status" "instance_status" DEFAULT 'pending' NOT NULL,
	"pve_node" text NOT NULL,
	"vm_id" integer NOT NULL,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "instance_ip_address_unique" UNIQUE("ip_address")
);
--> statement-breakpoint
CREATE TABLE "instance_course" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"course_title" text NOT NULL,
	"main_staff" integer NOT NULL,
	"assistant_staff_1" integer,
	"assistant_staff_2" integer,
	"assistant_staff_3" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "instance_request" (
	"id" serial PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"title" text NOT NULL,
	"hostname" text NOT NULL,
	"description" text NOT NULL,
	"type" "instance_request_type" NOT NULL,
	"course" integer NOT NULL,
	"template" integer NOT NULL,
	"cpus" integer NOT NULL,
	"memory" integer NOT NULL,
	"disk" integer NOT NULL,
	"state" "request_state" DEFAULT 'pending' NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instance_request_extends" (
	"id" serial PRIMARY KEY NOT NULL,
	"instance" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"state" "request_state" DEFAULT 'pending' NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instance_template" (
	"id" serial PRIMARY KEY NOT NULL,
	"os_name" text NOT NULL,
	"vm_template_id" text NOT NULL,
	"vm_template_host" text NOT NULL,
	"vm_type" "vm_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "pve_node" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" "node_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "pve_node_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ip_address" (
	"id" serial PRIMARY KEY NOT NULL,
	"network" serial NOT NULL,
	"ip" text NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "ip_address_ip_unique" UNIQUE("ip")
);
--> statement-breakpoint
CREATE TABLE "network" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"network" text NOT NULL,
	"gateway" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "samester" (
	"id" serial PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"start_at" timestamp NOT NULL,
	"end_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "samester_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_list" ADD CONSTRAINT "staff_list_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_public_key" ADD CONSTRAINT "user_public_key_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance" ADD CONSTRAINT "instance_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance" ADD CONSTRAINT "instance_course_instance_course_id_fk" FOREIGN KEY ("course") REFERENCES "public"."instance_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance" ADD CONSTRAINT "instance_samester_samester_id_fk" FOREIGN KEY ("samester") REFERENCES "public"."samester"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance" ADD CONSTRAINT "instance_template_instance_template_id_fk" FOREIGN KEY ("template") REFERENCES "public"."instance_template"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance" ADD CONSTRAINT "instance_pve_node_pve_node_name_fk" FOREIGN KEY ("pve_node") REFERENCES "public"."pve_node"("name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance" ADD CONSTRAINT "instance_ip_address_ip_address_ip_fk" FOREIGN KEY ("ip_address") REFERENCES "public"."ip_address"("ip") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_course" ADD CONSTRAINT "instance_course_main_staff_staff_list_id_fk" FOREIGN KEY ("main_staff") REFERENCES "public"."staff_list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_course" ADD CONSTRAINT "instance_course_assistant_staff_1_staff_list_id_fk" FOREIGN KEY ("assistant_staff_1") REFERENCES "public"."staff_list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_course" ADD CONSTRAINT "instance_course_assistant_staff_2_staff_list_id_fk" FOREIGN KEY ("assistant_staff_2") REFERENCES "public"."staff_list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_course" ADD CONSTRAINT "instance_course_assistant_staff_3_staff_list_id_fk" FOREIGN KEY ("assistant_staff_3") REFERENCES "public"."staff_list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_request" ADD CONSTRAINT "instance_request_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_request" ADD CONSTRAINT "instance_request_course_instance_course_id_fk" FOREIGN KEY ("course") REFERENCES "public"."instance_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_request" ADD CONSTRAINT "instance_request_template_instance_template_id_fk" FOREIGN KEY ("template") REFERENCES "public"."instance_template"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_request_extends" ADD CONSTRAINT "instance_request_extends_instance_instance_id_fk" FOREIGN KEY ("instance") REFERENCES "public"."instance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_template" ADD CONSTRAINT "instance_template_vm_template_host_pve_node_name_fk" FOREIGN KEY ("vm_template_host") REFERENCES "public"."pve_node"("name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ip_address" ADD CONSTRAINT "ip_address_network_network_id_fk" FOREIGN KEY ("network") REFERENCES "public"."network"("id") ON DELETE cascade ON UPDATE no action;