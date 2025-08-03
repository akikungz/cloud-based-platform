ALTER TABLE "instance" RENAME COLUMN "user_id" TO "user";--> statement-breakpoint
ALTER TABLE "instance" RENAME COLUMN "pve_node_id" TO "pve_node";--> statement-breakpoint
ALTER TABLE "instance_request" RENAME COLUMN "user_id" TO "user";--> statement-breakpoint
ALTER TABLE "instance_request_extends" RENAME COLUMN "instance_id" TO "instance";--> statement-breakpoint
ALTER TABLE "instance" DROP CONSTRAINT "instance_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "instance" DROP CONSTRAINT "instance_pve_node_id_pve_node_id_fk";
--> statement-breakpoint
ALTER TABLE "instance_request" DROP CONSTRAINT "instance_request_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "instance_request_extends" DROP CONSTRAINT "instance_request_extends_instance_id_instance_id_fk";
--> statement-breakpoint
ALTER TABLE "instance" ALTER COLUMN "samester" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "instance" ALTER COLUMN "vm_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "instance_course" ALTER COLUMN "course_staff" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "instance" ADD COLUMN "hostname" text NOT NULL;--> statement-breakpoint
ALTER TABLE "instance_request" ADD COLUMN "hostname" text NOT NULL;--> statement-breakpoint
ALTER TABLE "instance" ADD CONSTRAINT "instance_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance" ADD CONSTRAINT "instance_pve_node_pve_node_id_fk" FOREIGN KEY ("pve_node") REFERENCES "public"."pve_node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_request" ADD CONSTRAINT "instance_request_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_request_extends" ADD CONSTRAINT "instance_request_extends_instance_instance_id_fk" FOREIGN KEY ("instance") REFERENCES "public"."instance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_template" ADD CONSTRAINT "instance_template_vm_template_host_pve_node_name_fk" FOREIGN KEY ("vm_template_host") REFERENCES "public"."pve_node"("name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" DROP COLUMN "read_at";