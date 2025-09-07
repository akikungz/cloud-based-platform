import { and, eq, inArray } from "drizzle-orm";
import { db } from "@momoi/libs/db";
import { env } from "@momoi/libs/env";

import { mock_db } from "database";
import { instance, instance_request, instance_request_extends } from "database/schema/core/instances";

export class RequestsService {
  private static db = env.NODE_ENV === "test" ? mock_db : db;

  public static async getRequests(user: string) {
    // Logic to get requests
    const results = await this.db
      .select()
      .from(instance_request)
      .where(eq(instance_request.user, user));

    return results;
  }

  public static async getExtendRequests(user: string) {
    // Logic to get extend requests
    const instances = await this.db
      .select({ id: instance.id })
      .from(instance)
      .where(eq(instance.user, user));

    const results = await this.db
      .select()
      .from(instance_request_extends)
      .innerJoin(instance, eq(instance_request_extends.instance, instance.id))
      .where(inArray(instance.id, instances.map(i => i.id)));

    return results;
  }

  public static async createRequest(
    user: string,
    data: Omit<
      typeof instance_request.$inferInsert,
      "user" | "id" | "state" | "reason" | "created_at" | "updated_at"
    >
  ) {
    // Logic to create a new request
    const result = await this.db
      .insert(instance_request)
      .values({
        user,
        ...data
      })
      .returning();

    return result[0];
  }

  public static async createRequestExtends(
    data: Pick<
      typeof instance_request_extends.$inferInsert,
      "title" | "description" | "instance"
    >,
    user: string
  ) {
    // Check if the instance belongs to the user
    const user_instance = await this.db
      .select()
      .from(instance)
      .where(
        and(
          eq(instance.id, data.instance),
          eq(instance.user, user)
        )
      )
      .limit(1);

    if (user_instance.length === 0) {
      console.log(user);
      throw new Error("Instance not found or does not belong to the user");
    }

    // Logic to create a new request
    const result = await this.db
      .insert(instance_request_extends)
      .values({ ...data })
      .returning();

    return result[0];
  }
}