import { db } from "@momoi/libs/db";
import { BadRequestError, NotFoundError, ConflictError } from "@momoi/shared/errors";
import { Prisma } from "database/generated/prisma-client/client";
import { getRabbitMQPublisher } from "@momoi/libs/rabbitmq";

export class InstanceService {

  public static async getInstances(userId: string) {
    try {
      const results = await db.instance.findMany({
        where: { user_id: userId, NOT: { state: "deleted" } },
        select: {
          id: true,
          title: true,
          hostname: true,
          description: true,
          status: true,
          cpus: true,
          memory: true,
          disk: true,
          created_at: true,
          ip_address: {
            select: {
              ip: true,
              network: {
                select: {
                  name: true,
                  network: true,
                  gateway: true
                }
              }
            }
          },
          course: {
            select: {
              course_title: true,
              course_id: true
            }
          },
          semester: { select: { name: true } }
        }
      });
      return results.map(r => ({
        id: r.id,
        title: r.title,
        hostname: r.hostname,
        description: r.description,
        status: r.status,
        cpus: r.cpus,
        memory: r.memory,
        disk: r.disk,
        created_at: r.created_at,
        ip_address: r.ip_address,
        course: r.course,
        semester: r.semester?.name || "No Semester"
      }));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch instances");
    }
  }

  public static async getInstanceById(userId: string, id: number) {
    try {
      const result = await db.instance.findFirst({
        where: { user_id: userId, id, NOT: { state: "deleted" } },
        include: { semester: true }
      });
      
      if (!result) {
        throw new NotFoundError("Instance not found");
      }
      
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch instance");
    }
  }

  public static async deleteInstance(userId: string, id: number) {
    try {
      const existing = await db.instance.findFirst({
        where: { user_id: userId, id, NOT: { OR: [{ state: "deleted" }, { state: "archived" }] } }
      });
      
      if (!existing) {
        throw new NotFoundError("Instance not found or already deleted/archived");
      }

      return await db.instance.update({
        where: { id },
        data: { state: "deleted" }
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("Instance not found");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to delete instance");
    }
  }

  /**
   * Change VM status (start, stop, suspend, resume, reboot)
   * Students can only control their own VMs
   */
  public static async changeVMStatus(userId: string, id: number, action: 'start' | 'stop' | 'suspend' | 'resume' | 'reboot') {
    try {
      const instance = await db.instance.findFirst({
        where: { 
          user_id: userId,
          id,
          NOT: { state: "deleted" }
        }
      });

      if (!instance) {
        throw new NotFoundError("Instance not found or you don't have permission to control it");
      }

      // Archived instances cannot be controlled
      if (instance.state === "archived") {
        throw new BadRequestError("Cannot control archived instances. Please contact staff to unarchive first.");
      }

      // Send VM status change message to RabbitMQ queue (skip in test environment)
      if (process.env.NODE_ENV !== 'test') {
        try {
          const publisher = await getRabbitMQPublisher();
          
          const vmMessage = {
            type: 'vm.status' as const,
            data: {
              vmid: instance.vm_id,
              node: instance.pve_node,
              state: action
            },
            requestId: `student-status-${instance.id}-${Date.now()}`,
            userId: userId
          };

          await publisher.publishMessage(vmMessage);
          console.log(`VM status change message sent for instance ${instance.id}: ${action}`);
        } catch (rabbitError) {
          console.error('Failed to send VM status change message:', rabbitError);
          throw new BadRequestError('Failed to send status change request to VM manager');
        }
      }

      // Update the expected status in the database
      const statusMap: Record<typeof action, 'running' | 'stopped' | 'pending'> = {
        'start': 'running',
        'stop': 'stopped',
        'suspend': 'stopped',
        'resume': 'running',
        'reboot': 'running'
      };

      const updatedInstance = await db.instance.update({
        where: { id },
        data: { 
          status: statusMap[action],
          updated_at: new Date()
        }
      });

      return {
        id: updatedInstance.id,
        title: updatedInstance.title,
        hostname: updatedInstance.hostname,
        status: updatedInstance.status,
        action: action,
        vm_id: updatedInstance.vm_id,
        pve_node: updatedInstance.pve_node,
        updated_at: updatedInstance.updated_at
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to change VM status");
    }
  }
}