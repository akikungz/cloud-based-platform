import { db } from "@momoi/libs/db";
import type { Prisma } from "database/generated/prisma-client";
import { BadRequestError, NotFoundError, ConflictError } from "@momoi/shared/errors";
import { Prisma as PrismaClient } from "database/generated/prisma-client/client";

export class RequestsService {
  private static db = db;

  public static async getRequests(userId: string) {
    try {
      return await this.db.instance_request.findMany({
        where: { user_id: userId }
      });
    } catch (error) {
      if (error instanceof PrismaClient.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch requests");
    }
  }

  public static async getExtendRequests(userId: string) {
    try {
      const instances = await this.db.instance.findMany({
        where: { user_id: userId },
        select: { id: true }
      });
      const instanceIds = instances.map((i: { id: number }) => i.id);
      return await this.db.instance_request_extends.findMany({
        where: { instance_id: { in: instanceIds } },
        include: { instance: true }
      });
    } catch (error) {
      if (error instanceof PrismaClient.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch extend requests");
    }
  }

  public static async createRequest(
    userId: string,
    data: Omit<Prisma.instance_requestUncheckedCreateInput,
      "id" | "user_id" | "state" | "reason" | "created_at" | "updated_at">
  ) {
    try {
      return await this.db.instance_request.create({
        data: {
          user_id: userId,
          ...data
        }
      });
    } catch (error) {
      if (error instanceof PrismaClient.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictError("Request with similar data already exists");
        }
        if (error.code === "P2003") {
          throw new BadRequestError("Invalid foreign key reference");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to create request");
    }
  }

  public static async createRequestExtends(
    data: Pick<Prisma.instance_request_extendsUncheckedCreateInput, "title" | "description" | "instance_id">,
    userId: string
  ) {
    try {
      const userInstance = await this.db.instance.findFirst({
        where: { id: data.instance_id, user_id: userId }
      });
      
      if (!userInstance) {
        throw new NotFoundError("Instance not found or does not belong to the user");
      }

      return await this.db.instance_request_extends.create({
        data
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof PrismaClient.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictError("Extension request with similar data already exists");
        }
        if (error.code === "P2003") {
          throw new BadRequestError("Invalid foreign key reference");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to create extension request");
    }
  }
}