import { and, eq, not } from "drizzle-orm";
import { db } from "@momoi/libs/db";
import { env } from "@momoi/libs/env";

import { mock_db } from "database";
import { instance } from "database/schema/core/instances";
import { samester } from "database/schema/core/samester";

export class InstanceService {
  private static db = env.NODE_ENV === "test" ? (mock_db as unknown as typeof db) : db;

  public static async getInstances(user: string) {
    // Logic to get instances
    const results = await this.db
      .select({
        id: instance.id,
        title: instance.title,
        description: instance.description,
        status: instance.status,
        samester: samester.name,
        cpus: instance.cpus,
        memory: instance.memory,
        disk: instance.disk,
        ip_address: instance.ip_address
      })
      .from(instance)
      .where(
        and(
          eq(instance.user, user),
          not(eq(instance.state, "deleted"))
        )
      )
      .innerJoin(samester, eq(instance.samester, samester.id))

    return results;
  }

  public static async getInstanceById(user: string, id: number) {
    // Logic to get instance by id
    const result = await this.db
      .select()
      .from(instance)
      .where(
        and(
          eq(instance.user, user),
          eq(instance.id, id),
          not(eq(instance.state, "deleted"))
        )
      )
      .innerJoin(samester, eq(instance.samester, samester.id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return result[0];
  }

  public static async deleteInstance(user: string, id: number) {
    // Logic to delete instance
    const result = await this.db
      .update(instance)
      .set({ state: "deleted" })
      .where(
        and(
          eq(instance.user, user),
          eq(instance.id, id),
          not(eq(instance.state, "deleted")),
          not(eq(instance.state, "archived"))
        )
      )
      .returning();

    if (result.length === 0) {
      throw new Error("Instance not found or already deleted/archived");
    }

    return result[0];
  }
}