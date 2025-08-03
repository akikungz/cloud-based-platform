import { DrizzleAdapter } from "@core/adapters/drizzle";
import type { InstanceCourse } from "@core/schema/instance";
import type { User } from "@core/schema/user";
import type { db} from "db";
import { eq } from "drizzle-orm";

export class AutoComplete extends DrizzleAdapter {
  // biome-ignore lint/complexity/noUselessConstructor: This constructor is necessary for dependency injection
  constructor(database: ReturnType<typeof db>) {
    super(database);
  }

  public async getCourses(): Promise<Pick<InstanceCourse, "id" | "course_id" | "course_title">[]> {
    const result = await this.db
      .select({
        id: this.instance_course.id,
        course_id: this.instance_course.course_id,
        course_title: this.instance_course.course_title,
      })
      .from(this.instance_course)
      .execute();

    if (result.length === 0) {
      throw new Error("No courses found");
    }

    return result;
  }

  public async getStaffList(): Promise<Omit<User, "image">[]> {
    const result = await this.db
      .select({
        id: this.user.id,
        name: this.user.name,
        email: this.user.email,
      })
      .from(this.user)
      .innerJoin(
        this.staff_list,
        eq(this.user.id, this.staff_list.auth_id)
      )
      .execute();

    if (result.length === 0) {
      throw new Error("No staff found");
    }

    return result;
  }
  
  public async getTemplates(): Promise<{
    id: string;
    os_name: string;
  }[]> {
    const result = await this.db
      .select({
        id: this.instance_template.id,
        os_name: this.instance_template.os_name,
      })
      .from(this.instance_template)
      .execute();

    if (result.length === 0) {
      throw new Error("No templates found");
    }

    return result;
  }
}