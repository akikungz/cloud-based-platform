import { DrizzleAdapter } from "@core/adapters/drizzle";
import type { InstanceCourse } from "@core/schema/instance";
import type { db } from "db";
import { eq } from "drizzle-orm";

export class CourseManagement extends DrizzleAdapter {
  // biome-ignore lint/complexity/noUselessConstructor: This constructor is necessary for dependency injection
  constructor(database: ReturnType<typeof db>) {
    super(database);
  }

  public async getCourseById(id: string): Promise<{
    id: InstanceCourse["id"];
    title: InstanceCourse["course_title"];
  }> {
    const result = await this.db
      .select({
        id: this.instance_course.id,
        title: this.instance_course.course_title
      })
      .from(this.instance_course)
      .where(eq(this.instance_course.id, id))
      .execute();

    if (result.length === 0) {
      throw new Error("No course found for the given ID");
    }

    if (!result[0]) {
      throw new Error("No course found for the given ID");
    }

    return result[0];
  }

  public async createCourse(value: Omit<InstanceCourse, "id" | "created_at" | "updated_at">): Promise<InstanceCourse> {
    const result = await this.db
      .insert(this.instance_course)
      .values(value)
      .returning();

    if (result.length === 0) {
      throw new Error("Failed to create course");
    }

    if (!result[0]) {
      throw new Error("Failed to create course");
    }

    return result[0];
  }
}