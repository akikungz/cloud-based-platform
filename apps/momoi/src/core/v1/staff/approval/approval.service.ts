import { db } from "@momoi/libs/db";
import { BadRequestError } from "@momoi/shared/errors";
import { Prisma } from "database/generated/prisma-client/client";
import { getRabbitMQPublisher } from "@momoi/libs/rabbitmq";
import { logger } from "@momoi/libs/log";

export class ApprovalService {
  private static db = db;

  private static getStaffCourses(staff_id: number) {
    return this.db.instance_course.findMany({
      where: {
        OR: [
          { main_staff: staff_id },
          { assistant_staff_1: staff_id },
          { assistant_staff_2: staff_id },
          { assistant_staff_3: staff_id },
        ]
      },
      select: { id: true }
    });
  }

  public static async getApprovals(staff_id: number, { skip = 1, take = 10 }: { skip: number, take: number }) {
    const courses = await this.getStaffCourses(staff_id);
    const course_ids = courses.map(c => c.id);

    // Pagination
    const count = await this.db.instance_request.count({
      where: {
        course_id: { in: course_ids },
        state: "pending",
      }
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / take);
    if (skip > totalPages) skip = totalPages;
    if (skip < 1) skip = 1;
    skip = (skip - 1) * take;

    const data = await this.db.instance_request.findMany({
      where: {
        course_id: { in: course_ids },
        state: "pending",
      },
      include: {
        course: {
          select: { id: true, course_title: true, course_id: true }
        },
        user: {
          select: { name: true, email: true }
        },
      },
      skip,
      take,
    });

    return { count, totalPages, data };
  }

  public static async approveRequest({ request_id }: { request_id: number }, staff_id: number) {
    try {
      // First, get the request details before updating
      const request = await this.db.instance_request.findFirst({
        where: {
          id: request_id,
          course: {
            OR: [
              { main_staff: staff_id },
              { assistant_staff_1: staff_id },
              { assistant_staff_2: staff_id },
              { assistant_staff_3: staff_id },
            ]
          }
        },
        include: {
          template: true,
          user: true,
          course: true
        }
      });

      if (!request) {
        throw new BadRequestError("Request not found or you don't have permission to approve it");
      }

      // Update the request state to approved
      const approvedRequest = await this.db.instance_request.update({
        where: { id: request_id },
        data: { state: "approved" }
      });

      // Send VM creation message to RabbitMQ queue
      try {
        const publisher = await getRabbitMQPublisher();
        
        // Generate a unique VM ID (you might want to implement a better ID generation strategy)
        const vmid = 1000 + request_id; // Simple ID generation for now
        
        // Determine the target node (you might want to implement node selection logic)
        const targetNode = "pve-node-01"; // Default node, should be configurable
        
        await publisher.publishVMCreateMessage({
          vmid,
          templateId: request.template_id,
          name: request.hostname,
          node: targetNode,
          config: {
            cores: request.cpus,
            memory: request.memory,
            diskSize: `+${request.disk}G`, // Convert disk size to relative format
            ciuser: request.user.name?.toLowerCase().replace(/\s+/g, '') || 'student',
            cipassword: 'defaultPassword123', // You might want to generate this
            // Add network configuration if needed
            // ipconfig0: `ip=192.168.1.${100 + request_id}/24,gw=192.168.1.1`
          },
          requestId: `req-${request_id}`,
          userId: request.user_id.toString()
        });

        logger.info(`VM creation message sent to queue - RequestId: ${request_id}, VmId: ${vmid}, TemplateId: ${request.template_id}, UserId: ${request.user_id}`);

      } catch (queueError) {
        logger.error(`Failed to send VM creation message to queue - RequestId: ${request_id}, Error: ${queueError}`);
        // Don't fail the approval if queue message fails
        // The request is already approved in the database
      }

      return approvedRequest;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new BadRequestError("Request not found or you don't have permission to approve it");
        }

        if (error.code === "P2002") {
          throw new BadRequestError("Request already processed");
        }

        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Cannot approve this request");
    }
  }

  public static async rejectRequest({ request_id, reason }: { request_id: number, reason: string }, staff_id: number) {
    try {
      return await this.db.instance_request.update({
        where: {
          id: request_id,
          course: {
            OR: [
              { main_staff: staff_id },
              { assistant_staff_1: staff_id },
              { assistant_staff_2: staff_id },
              { assistant_staff_3: staff_id },
            ]
          }
        },
        data: {
          state: "rejected",
          reason
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new BadRequestError("Request not found or you don't have permission to reject it");
        }

        if (error.code === "P2002") {
          throw new BadRequestError("Request already processed");
        }

        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Cannot reject this request");
    }
  }

  public static async getExtendsRequests({ skip = 1, take = 10 }: { skip: number, take: number }) {
    // Pagination
    const count = await this.db.instance_request_extends.count({
      where: { state: "pending" }
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / take);
    if (skip > totalPages) skip = totalPages;
    if (skip < 1) skip = 1;
    skip = (skip - 1) * take;

    const data = await this.db.instance_request_extends.findMany({
      where: { state: "pending" },
      skip,
      take
    });

    return { count, totalPages, data };
  }

  public static async approveExtendsRequest({ request_id }: { request_id: number }) {
    try {
      return await this.db.instance_request_extends.update({
        where: { id: request_id },
        data: { state: "approved" }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new BadRequestError("Request not found");
        }

        if (error.code === "P2002") {
          throw new BadRequestError("Request already processed");
        }

        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Cannot approve this request");
    }
  }

  public static async rejectExtendsRequest({ request_id, reason }: { request_id: number, reason: string }) {
    try {
      return await this.db.instance_request_extends.update({
        where: { id: request_id },
        data: { state: "rejected", reason }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new BadRequestError("Request not found");
        }

        if (error.code === "P2002") {
          throw new BadRequestError("Request already processed");
        }

        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Cannot reject this request");
    }
  }

  public static async editRequest(
    { request_id, cpus, memory, disk }: {
      request_id: number;
      cpus?: number;
      memory?: number;
      disk?: number;
    },
    staff_id: number
  ) {
    try {
      // First, verify the request exists and the staff has permission to edit it
      const request = await this.db.instance_request.findFirst({
        where: {
          id: request_id,
          state: "pending", // Only allow editing pending requests
          course: {
            OR: [
              { main_staff: staff_id },
              { assistant_staff_1: staff_id },
              { assistant_staff_2: staff_id },
              { assistant_staff_3: staff_id },
            ]
          }
        },
        include: {
          template: true,
          user: true,
          course: true
        }
      });

      if (!request) {
        throw new BadRequestError("Request not found, already processed, or you don't have permission to edit it");
      }

      // Build update data object with only specification fields
      const updateData: any = {};
      if (cpus !== undefined) updateData.cpus = cpus;
      if (memory !== undefined) updateData.memory = memory;
      if (disk !== undefined) updateData.disk = disk;

      // Update the request
      const updatedRequest = await this.db.instance_request.update({
        where: { id: request_id },
        data: updateData,
        include: {
          template: true,
          user: true,
          course: true
        }
      });

      return updatedRequest;
    } catch (error) {
      console.error("Error editing request specification:", error);
      throw new BadRequestError("Failed to edit request specification");
    }
  }
}