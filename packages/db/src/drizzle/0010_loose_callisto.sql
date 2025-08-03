ALTER TABLE "instance_course" RENAME COLUMN "course_staff" TO "main_staff";--> statement-breakpoint
ALTER TABLE "instance_course" DROP CONSTRAINT "instance_course_course_staff_staff_list_id_fk";
--> statement-breakpoint
ALTER TABLE "instance_course" ADD COLUMN "assistant_staff_1" uuid;--> statement-breakpoint
ALTER TABLE "instance_course" ADD COLUMN "assistant_staff_2" uuid;--> statement-breakpoint
ALTER TABLE "instance_course" ADD COLUMN "assistant_staff_3" uuid;--> statement-breakpoint
ALTER TABLE "instance_course" ADD CONSTRAINT "instance_course_main_staff_staff_list_id_fk" FOREIGN KEY ("main_staff") REFERENCES "public"."staff_list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_course" ADD CONSTRAINT "instance_course_assistant_staff_1_staff_list_id_fk" FOREIGN KEY ("assistant_staff_1") REFERENCES "public"."staff_list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_course" ADD CONSTRAINT "instance_course_assistant_staff_2_staff_list_id_fk" FOREIGN KEY ("assistant_staff_2") REFERENCES "public"."staff_list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instance_course" ADD CONSTRAINT "instance_course_assistant_staff_3_staff_list_id_fk" FOREIGN KEY ("assistant_staff_3") REFERENCES "public"."staff_list"("id") ON DELETE cascade ON UPDATE no action;