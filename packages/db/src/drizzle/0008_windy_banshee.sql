ALTER TABLE "instance" DROP CONSTRAINT "instance_pve_node_pve_node_id_fk";
--> statement-breakpoint
ALTER TABLE "instance" ADD CONSTRAINT "instance_pve_node_pve_node_name_fk" FOREIGN KEY ("pve_node") REFERENCES "public"."pve_node"("name") ON DELETE cascade ON UPDATE no action;