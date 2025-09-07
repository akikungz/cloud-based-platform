import { eq } from "drizzle-orm";

import { db } from "@momoi/libs/db";
import { env } from "@momoi/libs/env";

import { mock_db } from "database";
import { user } from "database/schema/auth/better-auth";
import { instance_course, instance_template } from "database/schema/core/instances";
import { staff_list } from "database/schema/auth/user";

export class AutoCompleteService {
  private static db = env.NODE_ENV === "test" ? mock_db : db;

  public static async getCourse() {
    // Logic to get course autocomplete
    const results = await this.db
      .select({
        id: instance_course.id,
        title: instance_course.course_title,
        code: instance_course.course_id
      })
      .from(instance_course);

    return results;
  }

  public static async getStaff() {
    // Logic to get staff autocomplete
    const results = await this.db
      .select()
      .from(user)
      .innerJoin(staff_list, eq(user.id, staff_list.user_id));

    return results;
  }

  public static async getTemplate() {
    const results = await this.db
      .select({
        id: instance_template.id,
        os_name: instance_template.os_name,
        vm_type: instance_template.vm_type
      })
      .from(instance_template);

    return results;
  }
}