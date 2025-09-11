import { db } from "@momoi/libs/db";
import { BadRequestError } from "@momoi/shared/errors";
import { Prisma } from "database/generated/prisma-client/client";

export class AutoCompleteService {
  private static db = db;

  public static async getCourse() {
    try {
      const results = await this.db.instance_course.findMany({
        select: { id: true, course_title: true, course_id: true }
      });
      return results.map(r => ({ id: r.id, title: r.course_title, code: r.course_id }));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch courses");
    }
  }

  public static async getStaff() {
    try {
      // staff_list is a separate model with user_id string; fetch joins via two queries
      const staff = await this.db.staff_list.findMany({ select: { email: true } });

      return await this.db.user.findMany({
        where: { email: { in: staff.map(s => s.email) } },
        select: {
          id: true,
          name: true,
          email: true,
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch staff");
    }
  }

  public static async getStaffEmails() {
    try {
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch staff emails");
    }
  }

  public static async getTemplate() {
    try {
      return await this.db.instance_template.findMany({
        select: { id: true, os_name: true, vm_type: true }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch templates");
    }
  }
}