/**
 * Example usage of the Yuzu Consumer for VM operations
 * This file demonstrates how to send messages to create, manage, and delete VMs
 */

import { YuzuConsumer } from './index';

// Example message formats for different VM operations

// 1. Create VM message (automatic network configuration)
export const createVMMessage = {
  type: 'vm.create' as const,
  data: {
    vmid: 1001,
    templateId: 900, // Template VM ID
    name: 'student-vm-001',
    node: 'pve-node-01',
    config: {
      cores: 2,
      memory: 4096, // 4GB in MB
      diskSize: '20G',
      // net0 and ipconfig0 will be automatically configured based on assigned IP
      ciuser: 'student',
      cipassword: 'securepassword123',
      sshkeys: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC...'
    }
  },
  requestId: 'req-123',
  userId: 'user-456'
};

// 1b. Create VM message (manual network configuration)
export const createVMMessageManual = {
  type: 'vm.create' as const,
  data: {
    vmid: 1002,
    templateId: 900,
    name: 'staff-vm-001',
    node: 'pve-node-01',
    config: {
      cores: 4,
      memory: 8192,
      net0: 'model=virtio,bridge=staff-network', // Manual network interface
      ipconfig0: 'ip=10.0.1.50/24,gw=10.0.1.1', // Manual IP configuration
      ciuser: 'staff',
      cipassword: 'staffpassword123',
      sshkeys: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC...'
    }
  },
  requestId: 'req-124',
  userId: 'user-789'
};

// 2. Delete VM message
export const deleteVMMessage = {
  type: 'vm.delete' as const,
  data: {
    vmid: 1001,
    node: 'pve-node-01'
  },
  requestId: 'req-124',
  userId: 'user-456'
};

// 3. Resize VM message (total - user wants 8GB total)
export const resizeVMMessageTotal = {
  type: 'vm.resize' as const,
  data: {
    vmid: 1001,
    node: 'pve-node-01',
    size: 8, // User wants 8GB total disk size
    resizeType: 'total' as const
  },
  requestId: 'req-125',
  userId: 'user-456'
};

// 3b. Resize VM message (add - add 4.5GB to current size)
export const resizeVMMessageAdd = {
  type: 'vm.resize' as const,
  data: {
    vmid: 1001,
    node: 'pve-node-01',
    size: 4.5, // Add 4.5GB to current disk size
    resizeType: 'add' as const
  },
  requestId: 'req-125b',
  userId: 'user-456'
};

// 4. Change VM status message
export const statusVMMessage = {
  type: 'vm.status' as const,
  data: {
    vmid: 1001,
    node: 'pve-node-01',
    state: 'start' as const // 'start', 'stop', 'suspend', 'resume', 'reboot'
  },
  requestId: 'req-126',
  userId: 'user-456'
};

/**
 * Example of how to start the Yuzu Consumer
 */
export async function startYuzuConsumer() {
  const consumer = new YuzuConsumer();
  
  // Setup graceful shutdown
  consumer.setupGracefulShutdown();
  
  try {
    await consumer.start();
    console.log('Yuzu Consumer is running and ready to process VM messages');
  } catch (error) {
    console.error('Failed to start Yuzu Consumer:', error);
    process.exit(1);
  }
}

/**
 * Example of how to send a message to RabbitMQ
 * This would typically be done from the momoi service when a request is approved
 */
export function sendVMCreateMessage(rabbitMQChannel: any, message: typeof createVMMessage) {
  const exchange = 'vm.operations';
  const routingKey = 'vm.create';
  
  rabbitMQChannel.publish(
    exchange,
    routingKey,
    Buffer.from(JSON.stringify(message)),
    {
      persistent: true,
      messageId: message.requestId,
      timestamp: Date.now()
    }
  );
  
  console.log(`Sent VM create message: ${message.requestId}`);
}

// Example usage in main application
if (require.main === module) {
  startYuzuConsumer();
}
