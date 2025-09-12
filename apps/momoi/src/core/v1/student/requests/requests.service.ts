import { db } from "@momoi/libs/db";
import type { Prisma } from "database/generated/prisma-client";
import { BadRequestError, NotFoundError, ConflictError } from "@momoi/shared/errors";
import { Prisma as PrismaClient } from "database/generated/prisma-client/client";
import { getRabbitMQPublisher } from "@momoi/libs/rabbitmq";
import { logger } from "@momoi/libs/log";

export class RequestsService {
  private static db = db;

  public static async getRequests(userId: string) {
    try {
      return await this.db.instance_request.findMany({
        where: { user_id: userId }
      });
    } catch (error) {
      if (error instanceof PrismaClient.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch requests");
    }
  }

  public static async getExtendRequests(userId: string) {
    try {
      const instances = await this.db.instance.findMany({
        where: { user_id: userId },
        select: { id: true }
      });
      const instanceIds = instances.map((i: { id: number }) => i.id);
      return await this.db.instance_request_extends.findMany({
        where: { instance_id: { in: instanceIds } },
        include: { instance: true }
      });
    } catch (error) {
      if (error instanceof PrismaClient.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch extend requests");
    }
  }

  public static async createRequest(
    userId: string,
    data: Omit<Prisma.instance_requestUncheckedCreateInput,
      "id" | "user_id" | "state" | "reason" | "created_at" | "updated_at">
  ) {
    try {
      // Check if there's an active semester before allowing new instance requests
      const activeSemester = await this.db.semester.findFirst({
        where: { 
          active: true,
          deleted_at: null
        },
        orderBy: { created_at: 'desc' }
      });

      if (!activeSemester) {
        throw new BadRequestError("Cannot create new instance request: No active semester found. Please contact an administrator to activate a semester.");
      }

      return await this.db.instance_request.create({
        data: {
          user_id: userId,
          ...data
        }
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }

      if (error instanceof PrismaClient.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictError("Request with similar data already exists");
        }
        if (error.code === "P2003") {
          throw new BadRequestError("Invalid foreign key reference");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to create request");
    }
  }

  public static async createRequestExtends(
    data: Pick<Prisma.instance_request_extendsUncheckedCreateInput, "title" | "description" | "instance_id">,
    userId: string
  ) {
    try {
      const userInstance = await this.db.instance.findFirst({
        where: { id: data.instance_id, user_id: userId }
      });
      
      if (!userInstance) {
        throw new NotFoundError("Instance not found or does not belong to the user");
      }

      return await this.db.instance_request_extends.create({
        data
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof PrismaClient.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictError("Extension request with similar data already exists");
        }
        if (error.code === "P2003") {
          throw new BadRequestError("Invalid foreign key reference");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to create extension request");
    }
  }

  public static async createInstanceFromRequest(requestId: number, userId: string) {
    try {
      // First, verify the request exists, is approved, and belongs to the user
      const request = await this.db.instance_request.findFirst({
        where: {
          id: requestId,
          user_id: userId,
          state: 'approved'
        },
        include: {
          user: true,
          course: true,
          template: true
        }
      });

      if (!request) {
        throw new NotFoundError("Approved request not found or does not belong to the user");
      }

      // Check if an instance already exists for this request
      // We'll check by matching the hostname and user_id
      const existingInstance = await this.db.instance.findFirst({
        where: {
          user_id: userId,
          hostname: request.hostname,
          state: { not: 'deleted' }
        }
      });

      if (existingInstance) {
        throw new ConflictError("Instance already exists for this request");
      }

      // Get available PVE node
      const availableNode = await this.db.pve_node.findFirst({
        where: { status: 'online' }
      });

      if (!availableNode) {
        throw new BadRequestError("No available PVE nodes found");
      }

      // Send VM creation message to RabbitMQ queue (skip in test environment)
      if (process.env.NODE_ENV !== 'test') {
        try {
          const publisher = await getRabbitMQPublisher();
          
          // Generate a unique VM ID
          const vmid = 1000 + requestId;
          
          await publisher.publishVMCreateMessage({
            vmid,
            templateId: request.template_id,
            name: request.hostname,
            node: availableNode.name,
            config: {
              cores: request.cpus,
              memory: request.memory,
              diskSize: `+${request.disk}G`,
              ciuser: request.user.name?.toLowerCase().replace(/\s+/g, '') || 'student',
              cipassword: 'defaultPassword123',
            },
            requestId: `req-${requestId}`,
            userId: request.user_id
          });

          logger.info('VM creation message sent to queue', {
            requestId: requestId,
            vmid,
            templateId: request.template_id,
            userId: request.user_id
          } as any);

          // Return the request data for the yuzu service to create the instance
          return {
            requestId,
            request,
            vmid,
            node: availableNode.name
          };

        } catch (queueError) {
          logger.error('Failed to send VM creation message to queue', {
            requestId: requestId,
            error: queueError
          } as any);
          throw new BadRequestError("Failed to send VM creation message to queue");
        }
      } else {
        // In test environment, return request data without sending message
        return {
          requestId,
          request,
          vmid: 1000 + requestId,
          node: availableNode.name
        };
      }
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError || error instanceof BadRequestError) {
        throw error;
      }

      if (error instanceof PrismaClient.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictError("Instance with similar data already exists");
        }
        if (error.code === "P2003") {
          throw new BadRequestError("Invalid foreign key reference");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to create instance from request");
    }
  }
}