import { db } from "@momoi/libs/db";
import { env } from "@momoi/libs/env";

export class AutoCompleteService {
  private static db = db;

  public static async getCourse() {
    const results = await this.db.instance_course.findMany({
      select: { id: true, course_title: true, course_id: true }
    });
    return results.map(r => ({ id: r.id, title: r.course_title, code: r.course_id }));
  }

  public static async getStaff() {
    // staff_list is a separate model with user_id string; fetch joins via two queries
    const staff = await this.db.staff_list.findMany({ select: { user_id: true } });
    const ids = staff.map(s => s.user_id);
    return this.db.user.findMany({ where: { id: { in: ids } } });
  }

  public static async getTemplate() {
    return this.db.instance_template.findMany({
      select: { id: true, os_name: true, vm_type: true }
    });
  }
}