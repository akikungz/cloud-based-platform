ALTER TABLE "instance_template" DROP CONSTRAINT "instance_template_vm_template_host_pve_node_id_fk";
--> statement-breakpoint
ALTER TABLE "instance_template" ALTER COLUMN "vm_template_host" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "instance_template" ADD CONSTRAINT "instance_template_vm_template_host_pve_node_name_fk" FOREIGN KEY ("vm_template_host") REFERENCES "public"."pve_node"("name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pve_node" ADD CONSTRAINT "pve_node_name_unique" UNIQUE("name");