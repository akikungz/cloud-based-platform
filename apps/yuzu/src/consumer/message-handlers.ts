import { ConsumeMessage } from 'amqplib';
import { z } from 'zod';
import { db } from '../libs/db';

// Message schemas for different types of VM operations
export const VMCreateMessageSchema = z.object({
  type: z.literal('vm.create'),
  data: z.object({
    vmid: z.number(),
    templateId: z.number(),
    name: z.string(),
    node: z.string(),
    config: z.object({
      cores: z.number().optional(),
      memory: z.number().optional(),
      diskSize: z.string().optional(),
      ipconfig0: z.string().optional(),
      ciuser: z.string().optional(),
      cipassword: z.string().optional(),
      sshkeys: z.string().optional(),
    }).optional(),
  }),
  requestId: z.string(),
  userId: z.string(),
});

export const VMDeleteMessageSchema = z.object({
  type: z.literal('vm.delete'),
  data: z.object({
    vmid: z.number(),
    node: z.string(),
  }),
  requestId: z.string(),
  userId: z.string(),
});

export const VMResizeMessageSchema = z.object({
  type: z.literal('vm.resize'),
  data: z.object({
    vmid: z.number(),
    node: z.string(),
    size: z.string(), // e.g., "+10G"
  }),
  requestId: z.string(),
  userId: z.string(),
});

export const VMStatusMessageSchema = z.object({
  type: z.literal('vm.status'),
  data: z.object({
    vmid: z.number(),
    node: z.string(),
    state: z.enum(['start', 'stop', 'suspend', 'resume', 'reboot']),
  }),
  requestId: z.string(),
  userId: z.string(),
});

export type VMCreateMessage = z.infer<typeof VMCreateMessageSchema>;
export type VMDeleteMessage = z.infer<typeof VMDeleteMessageSchema>;
export type VMResizeMessage = z.infer<typeof VMResizeMessageSchema>;
export type VMStatusMessage = z.infer<typeof VMStatusMessageSchema>;

export type VMMessage = VMCreateMessage | VMDeleteMessage | VMResizeMessage | VMStatusMessage;

export interface MessageHandler {
  handle(message: VMMessage): Promise<void>;
}

export class VMMessageHandler implements MessageHandler {
  async handle(message: VMMessage): Promise<void> {
    console.log(`Processing message: ${message.type}`, { requestId: message.requestId, userId: message.userId });

    try {
      switch (message.type) {
        case 'vm.create':
          await this.handleVMCreate(message);
          break;
        case 'vm.delete':
          await this.handleVMDelete(message);
          break;
        case 'vm.resize':
          await this.handleVMResize(message);
          break;
        case 'vm.status':
          await this.handleVMStatus(message);
          break;
        default:
          console.warn(`Unknown message type: ${(message as any).type}`);
      }
    } catch (error) {
      console.error(`Error processing message ${message.type}:`, error);
      throw error;
    }
  }

  private async handleVMCreate(message: VMCreateMessage): Promise<void> {
    console.log(`Creating VM ${message.data.vmid} from template ${message.data.templateId}`);
    
    try {
      // Extract request ID from the message
      const requestId = parseInt(message.requestId.replace('req-', ''));
      
      // Get the original request data
      const request = await db.instance_request.findFirst({
        where: {
          id: requestId,
          user_id: message.userId,
          state: 'approved'
        },
        include: {
          user: true,
          course: true,
          template: true
        }
      });

      if (!request) {
        throw new Error(`Request ${requestId} not found or not approved`);
      }

      // Get the active semester
      const activeSemester = await db.semester.findFirst({
        where: { active: true }
      });

      if (!activeSemester) {
        throw new Error("No active semester found");
      }

      // Check if instance already exists
      const existingInstance = await db.instance.findFirst({
        where: {
          user_id: message.userId,
          hostname: request.hostname,
          state: { not: 'deleted' }
        }
      });

      if (existingInstance) {
        console.log(`Instance already exists for request ${requestId}`);
        return;
      }

      // Create the instance record in the database
      const instance = await db.instance.create({
        data: {
          user_id: message.userId,
          title: request.title,
          hostname: request.hostname,
          description: request.description,
          type: request.type,
          course_id: request.course_id,
          semester_id: activeSemester.id,
          template_id: request.template_id,
          cpus: request.cpus,
          memory: request.memory,
          disk: request.disk,
          state: 'active',
          status: 'pending',
          pve_node: message.data.node,
          vm_id: message.data.vmid,
        }
      });

      console.log(`Instance created in database with ID: ${instance.id}`);

      // TODO: Implement actual VM creation logic using PVE API
      // This would involve:
      // 1. Clone from template
      // 2. Configure VM settings
      // 3. Start VM
      // 4. Update database with VM status when complete

      // For now, just log the VM creation parameters
      console.log('VM creation parameters:', {
        vmid: message.data.vmid,
        templateId: message.data.templateId,
        name: message.data.name,
        node: message.data.node,
        config: message.data.config
      });

    } catch (error) {
      console.error(`Error creating VM ${message.data.vmid}:`, error);
      throw error;
    }
  }

  private async handleVMDelete(message: VMDeleteMessage): Promise<void> {
    console.log(`Deleting VM ${message.data.vmid} on node ${message.data.node}`);
    // TODO: Implement VM deletion logic using PVE API
    // This would involve:
    // 1. Stop VM if running
    // 2. Delete VM
    // 3. Update database
  }

  private async handleVMResize(message: VMResizeMessage): Promise<void> {
    console.log(`Resizing VM ${message.data.vmid} by ${message.data.size}`);
    // TODO: Implement VM resize logic using PVE API
    // This would involve:
    // 1. Resize disk
    // 2. Update database with new size
  }

  private async handleVMStatus(message: VMStatusMessage): Promise<void> {
    console.log(`Changing VM ${message.data.vmid} status to ${message.data.state}`);
    // TODO: Implement VM status change logic using PVE API
    // This would involve:
    // 1. Change VM state (start/stop/etc.)
    // 2. Update database with new status
  }
}

export function parseMessage(message: ConsumeMessage): VMMessage {
  const content = JSON.parse(message.content.toString());
  
  // Validate message based on type
  switch (content.type) {
    case 'vm.create':
      return VMCreateMessageSchema.parse(content);
    case 'vm.delete':
      return VMDeleteMessageSchema.parse(content);
    case 'vm.resize':
      return VMResizeMessageSchema.parse(content);
    case 'vm.status':
      return VMStatusMessageSchema.parse(content);
    default:
      throw new Error(`Unknown message type: ${content.type}`);
  }
}
