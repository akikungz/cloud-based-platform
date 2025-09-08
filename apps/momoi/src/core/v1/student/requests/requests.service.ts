import { db } from "@momoi/libs/db";
import type { Prisma } from "database/generated/prisma-client";

export class RequestsService {
  private static db = db;

  public static async getRequests(userId: string) {
    return this.db.instance_request.findMany({
      where: { user_id: userId }
    });
  }

  public static async getExtendRequests(userId: string) {
    const instances = await this.db.instance.findMany({
      where: { user_id: userId },
      select: { id: true }
    });
    const instanceIds = instances.map((i: { id: number }) => i.id);
    return this.db.instance_request_extends.findMany({
      where: { instance_id: { in: instanceIds } },
      include: { instance: true }
    });
  }

  public static async createRequest(
    userId: string,
    data: Omit<Prisma.instance_requestUncheckedCreateInput,
      "id" | "user_id" | "state" | "reason" | "created_at" | "updated_at">
  ) {
    return this.db.instance_request.create({
      data: {
        user_id: userId,
        ...data
      }
    });
  }

  public static async createRequestExtends(
    data: Pick<Prisma.instance_request_extendsUncheckedCreateInput, "title" | "description" | "instance_id">,
    userId: string
  ) {
    const userInstance = await this.db.instance.findFirst({
      where: { id: data.instance_id, user_id: userId }
    });
    if (!userInstance) {
      throw new Error("Instance not found or does not belong to the user");
    }
    return this.db.instance_request_extends.create({
      data
    });
  }
}