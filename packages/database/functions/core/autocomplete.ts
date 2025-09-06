import { eq, or } from "drizzle-orm";

import type { DB } from "database";
import { staff_list } from "database/schema/auth/user";
import { instance_course, instance_template } from "database/schema/core/instances";
import { user } from "database/schema/auth/better-auth";

export const get_staff = (db: DB) => {
  return db.select().from(staff_list);
}

export const get_course = (db: DB) => {
  return db.select({
    id: instance_course.id,
    code: instance_course.course_id,
    name: instance_course.course_title,
    main_staff: user.name,
    assistant_staff_1: user.name,
    assistant_staff_2: user.name,
    assistant_staff_3: user.name,
  })
    .from(instance_course)
    .innerJoin(user,
      or(
        eq(instance_course.main_staff, user.id),
        eq(instance_course.assistant_staff_1, user.id),
        eq(instance_course.assistant_staff_2, user.id),
        eq(instance_course.assistant_staff_3, user.id),
      )
    )
}

export const get_template = (db: DB) => {
  return db.select().from(instance_template);
}