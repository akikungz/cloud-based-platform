import { ConsumeMessage } from 'amqplib';
import { z } from 'zod';
import { db } from '../libs/db';
import { logger } from '../libs/log';
import type { instance, ip_address, network, instance_request, User, instance_course, instance_template, semester } from 'database/generated/prisma-client';

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
      net0: z.string().optional(), // Network interface configuration
      ipconfig0: z.string().optional(), // IP configuration
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
    size: z.union([
      z.string(), // e.g., "8G" for total desired size
      z.number()  // e.g., 8 for total desired size in GB
    ]),
    resizeType: z.enum(['total', 'add']).optional().default('total'),
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

// Type definitions for database entities with relations
export type InstanceRequestWithRelations = instance_request & {
  user: User;
  course: instance_course;
  template: instance_template;
};

export type InstanceWithRelations = instance & {
  user: User;
  course: instance_course;
  template: instance_template;
  semester: semester | null;
  ip_address: (ip_address & { network: network }) | null;
};

export type IPAddressWithNetwork = ip_address & {
  network: network;
};

export interface MessageHandler {
  handle(message: VMMessage): Promise<void>;
}

export class VMMessageHandler implements MessageHandler {
  /**
   * Validates that all required fields have proper values before instance creation
   */
  private validateInstanceCreationData(
    request: InstanceRequestWithRelations,
    activeSemester: semester,
    message: VMCreateMessage
  ): void {
    const errors: string[] = [];

    // Validate request fields
    if (!request.user_id) errors.push('Request user_id is missing');
    if (!request.title?.trim()) errors.push('Request title is missing or empty');
    if (!request.hostname?.trim()) errors.push('Request hostname is missing or empty');
    if (!request.description?.trim()) errors.push('Request description is missing or empty');
    if (!request.type) errors.push('Request type is missing');
    if (!request.course_id) errors.push('Request course_id is missing');
    if (!request.template_id) errors.push('Request template_id is missing');
    if (!request.cpus || request.cpus <= 0) errors.push('Request cpus must be greater than 0');
    if (!request.memory || request.memory <= 0) errors.push('Request memory must be greater than 0');
    if (!request.disk || request.disk <= 0) errors.push('Request disk must be greater than 0');

    // Validate semester
    if (!activeSemester?.id) errors.push('Active semester ID is missing');
    if (!activeSemester?.name?.trim()) errors.push('Active semester name is missing');

    // Validate message fields
    if (!message.userId?.trim()) errors.push('Message userId is missing');
    if (!message.data?.vmid) errors.push('Message vmid is missing');
    if (!message.data?.node?.trim()) errors.push('Message node is missing');
    if (!message.data?.templateId) errors.push('Message templateId is missing');

    if (errors.length > 0) {
      throw new Error(`Instance creation validation failed: ${errors.join(', ')}`);
    }

    logger.info('Instance creation data validation passed');
  }

  /**
   * Validates that the created instance has all required fields populated
   */
  private validateCreatedInstance(instance: instance): void {
    const errors: string[] = [];

    // Check critical fields that should never be null/empty
    if (!instance.id) errors.push('Instance ID is missing');
    if (!instance.user_id) errors.push('Instance user_id is missing');
    if (!instance.title?.trim()) errors.push('Instance title is missing or empty');
    if (!instance.hostname?.trim()) errors.push('Instance hostname is missing or empty');
    if (!instance.description?.trim()) errors.push('Instance description is missing or empty');
    if (!instance.type) errors.push('Instance type is missing');
    if (!instance.course_id) errors.push('Instance course_id is missing');
    if (!instance.semester_id) errors.push('Instance semester_id is missing - this should always have a value');
    if (!instance.template_id) errors.push('Instance template_id is missing');
    if (!instance.cpus || instance.cpus <= 0) errors.push('Instance cpus must be greater than 0');
    if (!instance.memory || instance.memory <= 0) errors.push('Instance memory must be greater than 0');
    if (!instance.disk || instance.disk <= 0) errors.push('Instance disk must be greater than 0');
    if (!instance.state) errors.push('Instance state is missing');
    if (!instance.status) errors.push('Instance status is missing');
    if (!instance.pve_node?.trim()) errors.push('Instance pve_node is missing');
    if (!instance.vm_id) errors.push('Instance vm_id is missing');
    if (!instance.created_at) errors.push('Instance created_at is missing');
    if (!instance.updated_at) errors.push('Instance updated_at is missing');

    if (errors.length > 0) {
      throw new Error(`Created instance validation failed: ${errors.join(', ')}`);
    }

    logger.info({ instanceId: instance.id }, 'Instance validation passed - all required fields have values');
  }

  async handle(message: VMMessage): Promise<void> {
    logger.info({
      messageType: message.type,
      requestId: message.requestId,
      userId: message.userId
    }, 'Processing message');

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
          logger.warn({ messageType: (message as any).type }, 'Unknown message type');
      }
    } catch (error) {
      logger.error({ error, messageType: message.type }, 'Error processing message');
      throw error;
    }
  }

  private async handleVMCreate(message: VMCreateMessage): Promise<void> {
    logger.info({
      vmid: message.data.vmid,
      templateId: message.data.templateId
    }, 'Creating VM from template');

    let instance: any = null;

    try {
      // Check if this is a staff-created instance or regular request
      if (message.requestId.startsWith('staff-')) {
        return await this.handleStaffVMCreate(message);
      }

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

      // Get the active semester with better error handling
      const activeSemester = await db.semester.findFirst({
        where: {
          active: true,
          deleted_at: null
        },
        orderBy: { created_at: 'desc' }
      });

      if (!activeSemester) {
        throw new Error("No active semester found. Please ensure there is an active semester configured in the system.");
      }

      logger.info({
        semesterName: activeSemester.name,
        semesterId: activeSemester.id
      }, 'Using active semester');

      // Check if instance already exists
      const existingInstance = await db.instance.findFirst({
        where: {
          user_id: message.userId,
          hostname: request.hostname,
          state: { not: 'deleted' }
        }
      });

      if (existingInstance) {
        logger.info({ requestId }, 'Instance already exists for request');
        return;
      }

      // Validate required fields before creating instance
      this.validateInstanceCreationData(request, activeSemester, message);

      // Validate that the PVE node exists in the database
      const pveNode = await db.pve_node.findFirst({
        where: {
          name: message.data.node,
          deleted_at: null
        }
      });

      if (!pveNode) {
        throw new Error(`PVE node '${message.data.node}' not found in database. Available nodes: ${(await db.pve_node.findMany({ where: { deleted_at: null }, select: { name: true } })).map(n => n.name).join(', ')}`);
      }

      // Create the instance record in the database first
      instance = await db.instance.create({
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

      logger.info({ instanceId: instance.id }, 'Instance created in database');

      // Validate that instance was created with all required fields
      this.validateCreatedInstance(instance);

      // Now create the actual VM in PVE
      await this.createVMInPVE(message, request, instance);

    } catch (error) {
      logger.error({ error, vmid: message.data.vmid }, 'Error creating VM');

      // Update instance status to indicate failure
      try {
        if (instance) {
          await db.instance.update({
            where: { id: instance.id },
            data: { status: 'stopped' }
          });
        }
      } catch (updateError) {
        logger.error({ error: updateError }, 'Failed to update instance status after error');
      }

      throw error;
    }
  }

  private async createVMInPVE(message: VMCreateMessage, request: InstanceRequestWithRelations, instance: instance): Promise<void> {
    const { qemu, task_status } = await import('../libs/pve');

    try {
      logger.info('Starting VM creation in PVE...');

      // Find template details
      const template = await db.instance_template.findFirst({
        where: { id: message.data.templateId }
      });

      if (!template) {
        throw new Error(`Template ${message.data.templateId} not found`);
      }

      // Use the node specified in the message (already validated in handleVMCreate)
      logger.info({ node: message.data.node }, 'Using PVE node');

      // Step 1: Clone from template
      logger.info({
        templateId: template.vm_template_id,
        newVmid: message.data.vmid
      }, 'Cloning VM from template');
      const cloneTask = await qemu.clone({
        node: template.vm_template_host,
        vmid: parseInt(template.vm_template_id),
        target: message.data.node, // PVE node target
        newid: message.data.vmid,
        name: message.data.name,
        full: true // Full clone
      });

      logger.info({ taskId: cloneTask.data }, 'Clone task started');

      // Wait for clone to complete (task runs on the template host node)
      await task_status(template.vm_template_host, cloneTask.data);
      logger.info('VM clone completed successfully');

      // Step 2: Assign IP address before VM configuration
      logger.info('Assigning IP address before VM configuration...');
      const assignedIP = await this.assignIPAddress(instance);

      // Prepare network configuration
      let networkConfig: { net0?: any; ipconfig0?: any } = {};

      if (assignedIP) {
        // Get network information for configuration
        const networkInfo = await db.network.findFirst({
          where: {
            id: assignedIP.network_id,
            deleted_at: null
          }
        });

        if (networkInfo) {
          // Configure network interface (net0) with bridge name from network
          networkConfig.net0 = `model=virtio,bridge=${networkInfo.name}`;

          // Configure IP address (ipconfig0) with assigned IP, subnet, and gateway
          networkConfig.ipconfig0 = `ip=${assignedIP.ip}/${this.getSubnetMask(networkInfo.network)},gw=${networkInfo.gateway}`;

          logger.info({
            net0: networkConfig.net0,
            ipconfig0: networkConfig.ipconfig0
          }, 'Network configuration applied');
        } else {
          logger.warn({ networkId: assignedIP.network_id }, 'Network not found, using default configuration');
        }
      } else {
        logger.warn('No IP address assigned, VM will be created without network configuration');
      }

      // Check instance user
      const instanceUser = await db.instance.findFirst({
        where: {
          vm_id: message.data.vmid,
          pve_node: message.data.node,
          state: { not: 'deleted' },
          user_id: message.userId,
        },
        include: {
          user: true,
        }
      });

      if (!instanceUser) {
        throw new Error(`Instance user not found for VM ${message.data.vmid}`);
      }

      // Step 3: Configure VM settings (including network and IP if assigned)
      console.log('Configuring VM settings...');
      const configTask = await qemu.config({
        node: instanceUser.pve_node,
        vmid: instanceUser.vm_id,
        cores: message.data.config?.cores || request.cpus,
        memory: message.data.config?.memory || request.memory,
        net0: networkConfig.net0,
        ipconfig0: networkConfig.ipconfig0,
        ciuser: instanceUser.user.email.split('@')[0],
        cipassword: "password",
        sshkeys: message.data.config?.sshkeys
      });

      console.log(`Config task started: ${configTask.data}`);

      // Wait for configuration to complete
      await task_status(instanceUser.pve_node, configTask.data);
      console.log('VM configuration completed successfully');

      // Step 4: Resize disk if specified
      if (message.data.config?.diskSize) {
        console.log(`Resizing disk for VM ${message.data.vmid} to ${message.data.config.diskSize}GB`);
        // Get based size from template
        const basedSize = template.based_size;
        // Calculate the new disk size based on resize type and template base size
        const newDiskSize = this.calculateNewDiskSize(message.data.config.diskSize, 'total', basedSize, basedSize);

        const resizeTask = await qemu.resize({
          node: instanceUser.pve_node,
          vmid: instanceUser.vm_id,
          size: newDiskSize.pveResizeSize as any // Type assertion for PVE_Disk_Resize
        });

        console.log(`Resize task started: ${resizeTask.data}`);

        // Wait for resize to complete
        await task_status(instanceUser.pve_node, resizeTask.data);
        console.log('VM disk resized successfully');
      }

      // Step 5: Start the VM
      console.log('Starting VM...');
      const startTask = await qemu.setStatusQEMU({
        node: instanceUser.pve_node,
        vmid: instanceUser.vm_id,
        state: 'start'
      });

      console.log(`Start task started: ${startTask.data}`);

      // Wait for VM to start
      await task_status(instanceUser.pve_node, startTask.data);
      console.log('VM started successfully');

      // Step 6: Update database with success status
      await db.instance.update({
        where: { id: instance.id },
        data: {
          status: 'running',
          updated_at: new Date()
        }
      });

      console.log(`VM ${message.data.vmid} created and started successfully`);

    } catch (error) {
      console.error('Error during VM creation in PVE:', error);

      // Update instance status to indicate failure
      await db.instance.update({
        where: { id: instance.id },
        data: {
          status: 'stopped',
          updated_at: new Date()
        }
      });

      throw error;
    }
  }

  private async handleVMDelete(message: VMDeleteMessage): Promise<void> {
    console.log(`Deleting VM ${message.data.vmid} on node ${message.data.node}`);

    try {
      const { qemu, task_status } = await import('../libs/pve');

      // Find the instance in database
      const instance = await db.instance.findFirst({
        where: {
          vm_id: message.data.vmid,
          pve_node: message.data.node,
          state: { not: 'deleted' }
        },
        select: {
          id: true,
          ip_address: {
            select: { id: true }
          }
        }
      });

      if (!instance) {
        console.log(`Instance with VM ID ${message.data.vmid} not found in database`);
        return;
      }

      // Step 1: Stop VM if running
      try {
        console.log('Stopping VM...');
        const stopTask = await qemu.setStatusQEMU({
          node: message.data.node,
          vmid: message.data.vmid,
          state: 'stop'
        });

        await task_status(message.data.node, stopTask.data);
        console.log('VM stopped successfully');
      } catch (error) {
        console.log('VM was already stopped or stop failed:', error);
      }

      // Step 2: Delete VM from PVE
      console.log('Deleting VM from PVE...');
      const deleteTask = await qemu.deleteQEMU({
        node: message.data.node,
        vmid: message.data.vmid
      });

      console.log(`Delete task started: ${deleteTask.data}`);
      await task_status(message.data.node, deleteTask.data);
      console.log('VM deleted from PVE successfully');

      // Step 3: Release IP address if assigned
      if (instance.ip_address?.id) {
        await this.releaseIPAddress(instance.ip_address.id);
        console.log(`Released IP address for instance ${instance.id}`);
      }

      // Step 4: Update database
      await db.instance.update({
        where: { id: instance.id },
        data: {
          state: 'deleted',
          status: 'stopped',
          deleted_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log(`VM ${message.data.vmid} deleted successfully`);

    } catch (error) {
      console.error(`Error deleting VM ${message.data.vmid}:`, error);
      throw error;
    }
  }

  private async handleVMResize(message: VMResizeMessage): Promise<void> {
    console.log(`Resizing VM ${message.data.vmid} with size: ${message.data.size} (type: ${message.data.resizeType})`);

    try {
      const { qemu, task_status } = await import('../libs/pve');

      // Find the instance in database with template information
      const instance = await db.instance.findFirst({
        where: {
          vm_id: message.data.vmid,
          pve_node: message.data.node,
          state: { not: 'deleted' }
        },
        include: {
          template: true
        }
      });

      if (!instance) {
        throw new Error(`Instance with VM ID ${message.data.vmid} not found in database`);
      }

      // Calculate the new disk size based on resize type
      const { newDiskSizeGB, pveResizeSize } = this.calculateNewDiskSize(
        message.data.size,
        message.data.resizeType,
        instance.disk,
        instance.template.based_size
      );

      console.log(`Current disk size: ${instance.disk}GB, Template base size: ${instance.template.based_size}GB`);
      console.log(`Calculated new disk size: ${newDiskSizeGB}GB`);

      // Step 1: Resize disk in PVE
      console.log(`Resizing VM disk by ${pveResizeSize}...`);
      const resizeTask = await qemu.resize({
        node: message.data.node,
        vmid: message.data.vmid,
        size: pveResizeSize as any // Type assertion for PVE_Disk_Resize
      });

      console.log(`Resize task started: ${resizeTask.data}`);
      await task_status(message.data.node, resizeTask.data);
      console.log('VM disk resized successfully');

      // Step 2: Update database with new size
      await db.instance.update({
        where: { id: instance.id },
        data: {
          disk: newDiskSizeGB,
          updated_at: new Date()
        }
      });

      console.log(`VM ${message.data.vmid} resized successfully. New disk size: ${newDiskSizeGB}GB`);

    } catch (error) {
      console.error(`Error resizing VM ${message.data.vmid}:`, error);
      throw error;
    }
  }

  private async handleVMStatus(message: VMStatusMessage): Promise<void> {
    console.log(`Changing VM ${message.data.vmid} status to ${message.data.state}`);

    try {
      const { qemu, task_status } = await import('../libs/pve');

      // Find the instance in database
      const instance = await db.instance.findFirst({
        where: {
          vm_id: message.data.vmid,
          pve_node: message.data.node,
          state: { not: 'deleted' }
        }
      });

      if (!instance) {
        throw new Error(`Instance with VM ID ${message.data.vmid} not found in database`);
      }

      // Step 1: Change VM state in PVE
      console.log(`Changing VM state to ${message.data.state}...`);
      const statusTask = await qemu.setStatusQEMU({
        node: message.data.node,
        vmid: message.data.vmid,
        state: message.data.state
      });

      console.log(`Status change task started: ${statusTask.data}`);
      await task_status(message.data.node, statusTask.data);
      console.log(`VM state changed to ${message.data.state} successfully`);

      // Step 2: Update database with new status
      const newStatus = message.data.state === 'start' ? 'running' :
        message.data.state === 'stop' ? 'stopped' :
          instance.status; // Keep current status for other states

      await db.instance.update({
        where: { id: instance.id },
        data: {
          status: newStatus,
          updated_at: new Date()
        }
      });

      console.log(`VM ${message.data.vmid} status updated to ${newStatus}`);

    } catch (error) {
      console.error(`Error changing VM ${message.data.vmid} status:`, error);
      throw error;
    }
  }

  /**
   * Helper method to get current VM status from PVE and update database
   */
  private async syncVMStatus(instance: instance): Promise<void> {
    try {
      const { qemu } = await import('../libs/pve');

      const vmStatus = await qemu.getStatusQEMU({
        node: instance.pve_node,
        vmid: instance.vm_id
      });

      const pveStatus = vmStatus.data.status;
      const dbStatus = pveStatus === 'running' ? 'running' : 'stopped';

      if (dbStatus !== instance.status) {
        await db.instance.update({
          where: { id: instance.id },
          data: {
            status: dbStatus,
            updated_at: new Date()
          }
        });
        console.log(`Synced VM ${instance.vm_id} status from ${instance.status} to ${dbStatus}`);
      }
    } catch (error) {
      console.error(`Error syncing VM status for ${instance.vm_id}:`, error);
    }
  }

  private async assignIPAddress(instance: instance): Promise<IPAddressWithNetwork | null> {
    try {
      // Find an available IP address with network information
      const availableIP = await this.selectAvailableIPAddress();

      if (!availableIP) {
        console.warn(`No available IP addresses found for instance ${instance.id} assignment. VM will be created without IP assignment.`);
        return null;
      }

      // Use a transaction to ensure atomicity
      await db.$transaction(async (tx) => {
        // Double-check IP is still available (race condition protection)
        const ipStillAvailable = await tx.ip_address.findFirst({
          where: {
            id: availableIP.id,
            // @ts-ignore - Prisma types seem incorrect for this relation
            instance: null
          }
        });

        if (!ipStillAvailable) {
          throw new Error(`IP address ${availableIP.ip} is no longer available`);
        }

        // Mark IP as used
        await tx.ip_address.update({
          where: { id: availableIP.id },
          data: {
            instance: {
              connect: { id: instance.id }
            },
            updated_at: new Date()
          }
        });

        // Assign IP to instance
        await tx.instance.update({
          where: { id: instance.id },
          data: {
            ip_address: {
              connect: {
                id: availableIP.id
              }
            },
            updated_at: new Date()
          }
        });
      });

      console.log(`Successfully assigned IP address ${availableIP.ip} (${availableIP.network.name}) to instance ${instance.id}`);
      return availableIP;
    } catch (error) {
      console.error(`Error assigning IP address to instance ${instance.id}:`, error);
      // Log the error but don't throw - VM can still function without IP assignment
      return null;
    }
  }


  /**
   * Release an IP address back to the pool
   */
  private async releaseIPAddress(ipAddressId: number): Promise<void> {
    try {
      await db.ip_address.update({
        where: { id: ipAddressId },
        data: {
          instance: {
            disconnect: {
              id: ipAddressId
            }
          },
          updated_at: new Date()
        }
      });
      console.log(`Released IP address with ID ${ipAddressId}`);
    } catch (error) {
      console.error(`Error releasing IP address ${ipAddressId}:`, error);
      throw error;
    }
  }

  /**
   * Helper method to calculate subnet mask from CIDR notation
   */
  private getSubnetMask(cidr: string): number {
    // Extract CIDR notation (e.g., "192.168.1.0/24" -> 24)
    const parts = cidr.split('/');
    if (parts.length === 2) {
      return parseInt(parts[1], 10);
    }
    // Default to /24 if not specified
    return 24;
  }

  /**
   * Calculate new disk size based on resize type and template base size
   * 
   * @param size - The size value from user input
   * @param resizeType - 'total' for desired total size, 'add' for amount to add
   * @param currentDiskSizeGB - Current disk size in GB
   * @param templateBaseSizeGB - Template base size in GB
   * @returns Object with new disk size and PVE resize command
   */
  private calculateNewDiskSize(
    size: string | number,
    resizeType: 'total' | 'add',
    currentDiskSizeGB: number,
    templateBaseSizeGB: number
  ): { newDiskSizeGB: number; pveResizeSize: string } {
    let newDiskSizeGB: number;
    let pveResizeSize: string;

    if (resizeType === 'total') {
      // Total resize: size is the desired total size in GB
      let targetSizeGB: number;

      if (typeof size === 'string') {
        // Parse string format like "8G" or "8.5G"
        const cleanSize = size.replace(/G$/, '');
        targetSizeGB = parseFloat(cleanSize);
      } else {
        // Number format
        targetSizeGB = size;
      }

      newDiskSizeGB = targetSizeGB;

      // Calculate the difference for PVE resize command
      const sizeDifferenceGB = targetSizeGB - currentDiskSizeGB;
      pveResizeSize = `+${sizeDifferenceGB}G`;

      console.log(`Total resize: User wants ${targetSizeGB}GB total, current is ${currentDiskSizeGB}GB, adding ${sizeDifferenceGB}GB`);
    } else {
      // Add resize: size is the amount to add
      let sizeToAddGB: number;

      if (typeof size === 'string') {
        // Parse string format like "+4.5G" or "4.5G"
        const cleanSize = size.replace(/^\+/, '').replace(/G$/, '');
        sizeToAddGB = parseFloat(cleanSize);
      } else {
        // Number format
        sizeToAddGB = size;
      }

      newDiskSizeGB = currentDiskSizeGB + sizeToAddGB;
      pveResizeSize = `+${sizeToAddGB}G`;

      console.log(`Add resize: Adding ${sizeToAddGB}GB to current ${currentDiskSizeGB}GB, new total will be ${newDiskSizeGB}GB`);
    }

    // Validate against template base size
    if (newDiskSizeGB < templateBaseSizeGB) {
      throw new Error(
        `New disk size (${newDiskSizeGB}GB) cannot be less than template base size (${templateBaseSizeGB}GB)`
      );
    }

    // Validate reasonable limits (e.g., max 1TB)
    const maxDiskSizeGB = 1024;
    if (newDiskSizeGB > maxDiskSizeGB) {
      throw new Error(
        `New disk size (${newDiskSizeGB}GB) exceeds maximum allowed size (${maxDiskSizeGB}GB)`
      );
    }

    // Validate that we're actually increasing the size
    if (newDiskSizeGB <= currentDiskSizeGB) {
      throw new Error(
        `New disk size (${newDiskSizeGB}GB) must be greater than current size (${currentDiskSizeGB}GB)`
      );
    }

    return { newDiskSizeGB, pveResizeSize };
  }

  /**
   * Enhanced IP address selection with network preference and random selection
   */
  private async selectAvailableIPAddress(preferredNetworkId?: number): Promise<IPAddressWithNetwork | null> {
    try {
      // First try to find a random IP in the preferred network
      if (preferredNetworkId) {
        const preferredIP = await this.selectRandomAvailableIP(preferredNetworkId);
        if (preferredIP) {
          return preferredIP;
        }
      }

      // Fallback to any available IP address (random selection)
      const availableIP = await this.selectRandomAvailableIP();
      return availableIP;
    } catch (error) {
      console.error('Error selecting available IP address:', error);
      return null;
    }
  }

  /**
   * Select a random available IP address from the database
   */
  private async selectRandomAvailableIP(networkId?: number): Promise<IPAddressWithNetwork | null> {
    try {

      // First, get the count of available IPs
      const availableCount = await db.ip_address.count({
        where: {
          ...(networkId ? { network_id: networkId } : {}),
          // @ts-ignore - Prisma types seem incorrect for this relation
          instance: null,
          deleted_at: null
        }
      });

      if (availableCount === 0) {
        console.log(`No available IP addresses found${networkId ? ` in network ${networkId}` : ''}`);
        return null;
      }

      // Generate a random offset
      const randomOffset = Math.floor(Math.random() * availableCount);

      // Get a random IP address using skip and take
      const randomIP = await db.ip_address.findFirst({
        where: {
          ...(networkId ? { network_id: networkId } : {}),
          // @ts-ignore - Prisma types seem incorrect for this relation
          instance: null,
          deleted_at: null
        },
        include: {
          network: true
        },
        skip: randomOffset,
        take: 1
      });

      if (randomIP) {
        console.log(`Selected random IP: ${randomIP.ip} from network: ${(randomIP as IPAddressWithNetwork).network.name} (offset: ${randomOffset}/${availableCount})`);
      }

      return randomIP as IPAddressWithNetwork | null;
    } catch (error) {
      console.error('Error selecting random available IP address:', error);
      return null;
    }
  }

  /**
   * Handle VM creation for staff-created instances (bypasses request and semester locks)
   */
  private async handleStaffVMCreate(message: VMCreateMessage): Promise<void> {
    console.log(`Creating staff VM ${message.data.vmid} from template ${message.data.templateId}`);

    let instance: any = null;

    try {
      // Extract instance ID from the message
      const instanceId = parseInt(message.requestId.replace('staff-', ''));

      // Get the instance data directly from the database
      const instanceData = await db.instance.findFirst({
        where: {
          id: instanceId,
          user_id: message.userId,
          state: 'active'
        },
        include: {
          user: true,
          course: true,
          template: true,
          semester: true
        }
      });

      if (!instanceData) {
        throw new Error(`Staff instance ${instanceId} not found or not active`);
      }

      console.log(`Processing staff-created instance: ${instanceData.title} (ID: ${instanceData.id})`);

      // Validate that the PVE node exists in the database
      const pveNode = await db.pve_node.findFirst({
        where: {
          name: message.data.node,
          deleted_at: null
        }
      });

      if (!pveNode) {
        throw new Error(`PVE node '${message.data.node}' not found in database. Available nodes: ${(await db.pve_node.findMany({ where: { deleted_at: null }, select: { name: true } })).map(n => n.name).join(', ')}`);
      }

      // Check if instance already exists with same hostname
      const existingInstance = await db.instance.findFirst({
        where: {
          user_id: message.userId,
          hostname: instanceData.hostname,
          state: { not: 'deleted' },
          id: { not: instanceId }
        }
      });

      if (existingInstance) {
        console.log(`Instance already exists for hostname ${instanceData.hostname}`);
        return;
      }

      // Update instance status to pending
      instance = await db.instance.update({
        where: { id: instanceId },
        data: { status: 'pending' }
      });

      console.log(`Staff instance updated in database with ID: ${instance.id}`);

      // Now create the actual VM in PVE
      // Convert instanceData to the expected format for createVMInPVE
      const requestData = {
        id: instanceData.id,
        user_id: instanceData.user_id,
        title: instanceData.title,
        hostname: instanceData.hostname,
        description: instanceData.description,
        type: instanceData.type,
        course_id: instanceData.course_id,
        template_id: instanceData.template_id,
        cpus: instanceData.cpus,
        memory: instanceData.memory,
        disk: instanceData.disk,
        state: 'approved' as any,
        reason: null, // Staff-created instances don't have a reason
        created_at: instanceData.created_at,
        updated_at: instanceData.updated_at,
        user: instanceData.user,
        course: instanceData.course,
        template: instanceData.template
      };

      await this.createVMInPVE(message, requestData, instance);

    } catch (error) {
      console.error(`Error creating staff VM ${message.data.vmid}:`, error);

      // Update instance status to failed if it exists
      if (instance) {
        try {
          await db.instance.update({
            where: { id: instance.id },
            data: { status: 'stopped' }
          });
        } catch (updateError) {
          console.error('Failed to update instance status to failed:', updateError);
        }
      }

      throw error;
    }
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
