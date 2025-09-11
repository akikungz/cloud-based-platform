import { db } from "@momoi/libs/db";
import { BadRequestError, NotFoundError, ConflictError } from "@momoi/shared/errors";
import { Prisma } from "database/generated/prisma-client/client";

export class InstanceService {
  private static db = db;

  public static async getInstances(userId: string) {
    try {
      const results = await this.db.instance.findMany({
        where: { user_id: userId, NOT: { state: "deleted" } },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          cpus: true,
          memory: true,
          disk: true,
          ip_address: true,
          semester: { select: { name: true } }
        }
      });
      return results.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        status: r.status,
        semester: r.semester?.name || "No Semester",
        cpus: r.cpus,
        memory: r.memory,
        disk: r.disk,
        ip_address: r.ip_address
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

  public static async getInstanceById(userId: string, id: number) {
    try {
      const result = await this.db.instance.findFirst({
        where: { user_id: userId, id, NOT: { state: "deleted" } },
        include: { semester: true }
      });
      
      if (!result) {
        throw new NotFoundError("Instance not found");
      }
      
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch instance");
    }
  }

  public static async deleteInstance(userId: string, id: number) {
    try {
      const existing = await this.db.instance.findFirst({
        where: { user_id: userId, id, NOT: { OR: [{ state: "deleted" }, { state: "archived" }] } }
      });
      
      if (!existing) {
        throw new NotFoundError("Instance not found or already deleted/archived");
      }

      return await this.db.instance.update({
        where: { id },
        data: { state: "deleted" }
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("Instance not found");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to delete instance");
    }
  }
}