import { db } from "@momoi/libs/db";
import { BadRequestError } from "@momoi/shared/errors";
import { Prisma } from "database/generated/prisma-client/client";

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
    try {
      return await this.db.instance_request.update({
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new BadRequestError("Request not found or you don't have permission to approve it");
        }

        if (error.code === "P2002") {
          throw new BadRequestError("Request already processed");
        }

        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Cannot approve this request");
    }
  }

  public static async rejectRequest({ request_id, reason }: { request_id: number, reason: string }, staff_id: number) {
    try {
      return await this.db.instance_request.update({
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new BadRequestError("Request not found or you don't have permission to reject it");
        }

        if (error.code === "P2002") {
          throw new BadRequestError("Request already processed");
        }

        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Cannot reject this request");
    }
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
    try {
      return await this.db.instance_request_extends.update({
        where: { id: request_id },
        data: { state: "approved" }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new BadRequestError("Request not found");
        }

        if (error.code === "P2002") {
          throw new BadRequestError("Request already processed");
        }

        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Cannot approve this request");
    }
  }

  public static async rejectExtendsRequest({ request_id, reason }: { request_id: number, reason: string }) {
    try {
      return await this.db.instance_request_extends.update({
        where: { id: request_id },
        data: { state: "rejected", reason }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new BadRequestError("Request not found");
        }

        if (error.code === "P2002") {
          throw new BadRequestError("Request already processed");
        }

        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Cannot reject this request");
    }
  }
}