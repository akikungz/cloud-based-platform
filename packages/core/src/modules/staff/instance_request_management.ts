import { DrizzleAdapter } from "@core/adapters/drizzle";
import { and, eq } from "drizzle-orm";

export class InstanceRequestManagement extends DrizzleAdapter {
  public async getInstanceRequestsByStaffId(staff_id: string, limit: number = 10, offset: number = 0) {
    const result = await this.db
      .select({
        id: this.instance_request.id,
        title: this.instance_request.title,
        description: this.instance_request.description,
        user: this.user.name,
        course_id: this.instance_course.course_id,
        course_title: this.instance_course.course_title,
        template_os_name: this.instance_template.os_name,
        cpus: this.instance_request.cpus,
        memory: this.instance_request.memory,
        disk: this.instance_request.disk,
        created_at: this.instance_request.created_at,
      })
      .from(this.instance_request)
      .innerJoin(
        this.instance_course,
        eq(this.instance_request.course, this.instance_course.id)
      )
      .innerJoin(
        this.user, 
        eq(this.instance_request.user, this.user.id)
      )
      .innerJoin(
        this.instance_template,
        eq(this.instance_request.template, this.instance_template.id)
      )
      .where(
        and(
          eq(this.instance_course.course_staff, staff_id),
          eq(this.instance_request.state, "pending")
        )
      )
      .limit(limit)
      .offset(offset);

    return {
      data: result.map((request) => {
        return {
          id: request.id,
          title: request.title,
          description: request.description,
          user: request.user,
          course: {
            id: request.course_id,
            title: request.course_title,
          },
          specs: {
            os: request.template_os_name,
            cpus: request.cpus,
            memory: request.memory,
            disk: request.disk,
          },
          created_at: request.created_at,
        };
      }),
      message: `Retrieved ${result.length} pending instance requests for staff with id ${staff_id}`,
    };
  }

  public async getInstanceRequestById(requestId: string) {
    const result = await this.db
      .select({
        // Base request fields
        id: this.instance_request.id,
        title: this.instance_request.title,
        description: this.instance_request.description,
        // User details
        user_id: this.user.id,
        user_name: this.user.name,
        user_email: this.user.email,
        // Course details
        course_id: this.instance_course.course_id,
        course_title: this.instance_course.course_title,
        // Template details
        template_id: this.instance_template.id,
        template_os_name: this.instance_template.os_name,
        // Instance specifications
        cpus: this.instance_request.cpus,
        memory: this.instance_request.memory,
        disk: this.instance_request.disk,
        // Request state
        state: this.instance_request.state,
        // Timestamps
        created_at: this.instance_request.created_at,
      })
      .from(this.instance_request)
      .innerJoin(
        this.instance_course,
        eq(this.instance_request.course, this.instance_course.id)
      )
      .innerJoin(
        this.user, 
        eq(this.instance_request.user, this.user.id)
      )
      .innerJoin(
        this.instance_template,
        eq(this.instance_request.template, this.instance_template.id)
      )
      .where(eq(this.instance_request.id, requestId))
      .execute();
    
    if (result.length === 0) {
      throw new Error(`No instance request found with id ${requestId}`);
    }

    if (!result[0]) {
      throw new Error(`Instance request with id ${requestId} does not exist`);
    }

    const request = result[0];
    return {
      data: {
        id: request.id,
        title: request.title,
        description: request.description,
        user: {
          id: request.user_id,
          name: request.user_name,
          email: request.user_email,
        },
        course: {
          id: request.course_id,
          title: request.course_title,
        },
        specs: {
          os: request.template_os_name,
          cpus: request.cpus,
          memory: request.memory,
          disk: request.disk,
        },
        state: request.state,
        created_at: request.created_at,
      },
      message: `Instance request with id ${requestId} retrieved successfully`,
    }
  }

  public async approveInstanceRequest(requestId: string) {
    const result = await this.db
      .update(this.instance_request)
      .set({ state: "approved" })
      .where(eq(this.instance_request.id, requestId))
      .returning();

    if (result.length === 0) {
      throw new Error(`Failed to approve instance request with id ${requestId}`);
    }

    return {
      message: `Instance request with id ${requestId} has been approved`,
    }
  }

  public async rejectInstanceRequest(requestId: string, reason: string) {
    const result = await this.db
      .update(this.instance_request)
      .set({ state: "rejected", reason })
      .where(eq(this.instance_request.id, requestId))
      .returning();

    if (result.length === 0) {
      throw new Error(`Failed to reject instance request with id ${requestId}`);
    }

    return {
      message: `Instance request with id ${requestId} has been rejected`,
      reason,
    };
  }
}