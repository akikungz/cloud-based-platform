import { db } from "@momoi/libs/db";
import { BadRequestError, NotFoundError } from "@momoi/shared/errors";
import { Prisma } from "database/generated/prisma-client/client";

export class StaffInstanceService {
  private static db = db;

  public static async getAllInstances() {
    try {
      const results = await this.db.instance.findMany({
        where: { NOT: { state: "deleted" } },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          cpus: true,
          memory: true,
          disk: true,
          ip_address: true,
          created_at: true,
          updated_at: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          semester: { 
            select: { 
              name: true,
              id: true
            } 
          },
          course: {
            select: {
              course_title: true,
              id: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      
      return results.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        status: r.status,
        semester: r.semester?.name || "No Semester",
        course: r.course?.course_title || "No Course",
        cpus: r.cpus,
        memory: r.memory,
        disk: r.disk,
        ip_address: r.ip_address,
        created_at: r.created_at,
        updated_at: r.updated_at,
        user: {
          id: r.user.id,
          email: r.user.email,
          name: r.user.name || "No name"
        }
      }));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch instances");
    }
  }

  public static async getInstanceById(id: number) {
    try {
      const result = await this.db.instance.findFirst({
        where: { 
          id: id,
          NOT: { state: "deleted" } 
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          cpus: true,
          memory: true,
          disk: true,
          ip_address: true,
          created_at: true,
          updated_at: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          semester: { 
            select: { 
              name: true,
              id: true
            } 
          },
          course: {
            select: {
              course_title: true,
              id: true
            }
          }
        }
      });

      if (!result) {
        throw new NotFoundError("Instance not found");
      }

      return {
        id: result.id,
        title: result.title,
        description: result.description,
        status: result.status,
        semester: result.semester?.name || "No Semester",
        course: result.course?.course_title || "No Course",
        cpus: result.cpus,
        memory: result.memory,
        disk: result.disk,
        ip_address: result.ip_address,
        created_at: result.created_at,
        updated_at: result.updated_at,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name || "No name"
        }
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch instance");
    }
  }

  public static async getInstancesStats() {
    try {
      const totalInstances = await this.db.instance.count({
        where: { NOT: { state: "deleted" } }
      });

      const runningInstances = await this.db.instance.count({
        where: { 
          status: "running",
          NOT: { state: "deleted" } 
        }
      });

      const stoppedInstances = await this.db.instance.count({
        where: { 
          status: "stopped",
          NOT: { state: "deleted" } 
        }
      });

      const pendingInstances = await this.db.instance.count({
        where: { 
          status: "pending",
          NOT: { state: "deleted" } 
        }
      });

      return {
        total: totalInstances,
        running: runningInstances,
        stopped: stoppedInstances,
        pending: pendingInstances
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch instance statistics");
    }
  }
}
