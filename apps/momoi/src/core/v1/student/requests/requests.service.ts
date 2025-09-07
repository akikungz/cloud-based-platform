import { eq } from "drizzle-orm";
import { db } from "@momoi/libs/db";
import { env } from "@momoi/libs/env";

import { mock_db } from "database";
import { instance_request } from "database/schema/core/instances";

export class RequestsService {
  private static db = env.NODE_ENV === "test" ? mock_db : db;

  public static async getRequests(user: string) {
    // Logic to get requests
    const results = await this.db.select()
      .from(instance_request)
      .where(eq(instance_request.user, user));

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
    const result = await this.db.insert(instance_request).values({
      user,
      ...data
    }).returning();

    return result[0];
  }
}