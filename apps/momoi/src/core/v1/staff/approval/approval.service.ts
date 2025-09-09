import { db } from "@momoi/libs/db";

export class ApprovalService {
  private static db = db;

  private static getStaffCourses(staff_id: number) {
    return this.db.instance_course.findMany({
      where: {
        OR: [
          { main_staff: staff_id },
          { assistant_staff_1: staff_id },
          { assistant_staff_2: staff_id },
          { assistant_staff_3: staff_id },
        ]
      },
      select: { id: true }
    });
  }

  public static async getApprovals(staff_id: number, { skip = 1, take = 10 }: { skip: number, take: number }) {
    const courses = await this.getStaffCourses(staff_id);
    const course_ids = courses.map(c => c.id);

    // Pagination
    const count = await this.db.instance_request.count({
      where: {
        course_id: { in: course_ids },
        state: "pending",
      }
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / take);
    if (skip > totalPages) skip = totalPages;
    if (skip < 1) skip = 1;
    skip = (skip - 1) * take;

    const data = await this.db.instance_request.findMany({
      where: {
        course_id: { in: course_ids },
        state: "pending",
      },
      include: {
        course: {
          select: { id: true, course_title: true, course_id: true }
        },
        user: {
          select: { name: true, email: true }
        },
      },
      skip,
      take,
    });

    return { count, totalPages, data };
  }

  public static async approveRequest({ request_id }: { request_id: number }, staff_id: number) {
    return this.db.instance_request.update({
      where: {
        id: request_id,
        course: {
          OR: [
            { main_staff: staff_id },
            { assistant_staff_1: staff_id },
            { assistant_staff_2: staff_id },
            { assistant_staff_3: staff_id },
          ]
        }
      },
      data: { state: "approved" }
    });
  }

  public static async rejectRequest({ request_id, reason }: { request_id: number, reason: string }, staff_id: number) {
    return this.db.instance_request.update({
      where: {
        id: request_id,
        course: {
          OR: [
            { main_staff: staff_id },
            { assistant_staff_1: staff_id },
            { assistant_staff_2: staff_id },
            { assistant_staff_3: staff_id },
          ]
        }
      },
      data: {
        state: "rejected",
        reason
      }
    });
  }

  public static async getExtendsRequests({ skip = 1, take = 10 }: { skip: number, take: number }) {
    // Pagination
    const count = await this.db.instance_request_extends.count({
      where: { state: "pending" }
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / take);
    if (skip > totalPages) skip = totalPages;
    if (skip < 1) skip = 1;
    skip = (skip - 1) * take;

    const data = await this.db.instance_request_extends.findMany({
      where: { state: "pending" },
      skip,
      take
    });

    return { count, totalPages, data };
  }

  public static async approveExtendsRequest({ request_id }: { request_id: number }) {
    return this.db.instance_request_extends.update({
      where: { id: request_id },
      data: { state: "approved" }
    });
  }

  public static async rejectExtendsRequest({ request_id, reason }: { request_id: number, reason: string }) {
    return this.db.instance_request_extends.update({
      where: { id: request_id },
      data: { state: "rejected", reason }
    });
  }
}