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
    staff: {
      id: string;
      name: string;
      email: string;
    }
  }> {
    const result = await this.db
      .select({
        id: this.instance_course.id,
        title: this.instance_course.course_title,
        staff_id: this.user.id,
        staff_name: this.user.name,
        staff_email: this.user.email, // Assuming email is part of the user schema
      })
      .from(this.instance_course)
      .innerJoin(
        this.user,
        eq(this.instance_course.course_staff, this.user.id)
      )
      .where(eq(this.instance_course.id, id))
      .execute();

    if (result.length === 0) {
      throw new Error("No course found for the given ID");
    }

    if (!result[0]) {
      throw new Error("No course found for the given ID");
    }

    const course = result[0];
    return {
      id: course.id,
      title: course.title,
      staff: {
        id: course.staff_id,
        name: course.staff_name,
        email: course.staff_email, // Assuming email is part of the user schema
      },
    }
  }

  public async createCourse(value: Pick<InstanceCourse, "course_id" | "course_title" | "course_staff">): Promise<InstanceCourse> {
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