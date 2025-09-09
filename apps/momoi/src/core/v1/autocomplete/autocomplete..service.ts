import { db } from "@momoi/libs/db";

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
    const staff = await this.db.staff_list.findMany({ select: { email: true } });

    return this.db.user.findMany({
      where: { email: { in: staff.map(s => s.email) } },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });
  }

  public static async getStaffEmails() {
    const staffs = await this.db
      .user
      .findMany({
        where: { email: { endsWith: "@itm.kmutnb.ac.th" } },
        select: { email: true }
      })

    const listed_staffs = await this.db
      .staff_list
      .findMany({ select: { email: true } });

    return staffs
      .map((s) => {
        return {
          email: s.email,
          is_staff: listed_staffs.some(ls => ls.email === s.email)
        }
      })
  }

  public static async getTemplate() {
    return this.db.instance_template.findMany({
      select: { id: true, os_name: true, vm_type: true }
    });
  }
}