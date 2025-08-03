import { DrizzleAdapter } from "@core/adapters/drizzle";
import type { Samester } from "@core/schema/samester";
import type { db } from "db";
import { eq } from "drizzle-orm";

export class SamesterManagement extends DrizzleAdapter {
  // biome-ignore lint/complexity/noUselessConstructor: This constructor is necessary for dependency injection
  constructor(database: ReturnType<typeof db>) {
    super(database);
  }

  public async getAllSamesters(): Promise<Samester[]> {
    const result = await this.db
      .select()
      .from(this.samester)
      .orderBy(this.samester.start_at)
      .execute();

    if (result.length === 0) {
      throw new Error("No samesters found");
    }

    return result;
  }

  public async getSamesterById(id: string): Promise<Samester> {
    const result = await this.db
      .select()
      .from(this.samester)
      .where(eq(this.samester.id, id))
      .execute();

    if (result.length === 0) {
      throw new Error(`No samester found with id ${id}`);
    }

    if (!result[0]) {
      throw new Error(`No samester found with id ${id}`);
    }

    return result[0];
  }

  public async createSamester(value: Pick<Samester, "name" | "start_at" | "end_at">): Promise<Samester> {
    const result = await this.db
      .insert(this.samester)
      .values(value)
      .returning();

    if (result.length === 0) {
      throw new Error("Failed to create samester");
    }

    if (!result[0]) {
      throw new Error("Failed to create samester");
    }

    return result[0];
  }

  public async updateSamester(id: string, value: Partial<Samester>): Promise<Samester> {
    const result = await this.db
      .update(this.samester)
      .set(value)
      .where(eq(this.samester.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Failed to update samester with id ${id}`);
    }

    if (!result[0]) {
      throw new Error(`Failed to update samester with id ${id}`);
    }

    return result[0];
  }
}