/**
 * Example usage of the Yuzu RabbitMQ Consumer
 * 
 * This file demonstrates how to use the consumer service
 * and how to send messages to it.
 */

import { YuzuConsumer } from './index';

// Example of how to start the consumer
async function startConsumer() {
  const consumer = new YuzuConsumer();
  
  // Setup graceful shutdown
  consumer.setupGracefulShutdown();
  
  try {
    await consumer.start();
    console.log('Consumer started successfully');
  } catch (error) {
    console.error('Failed to start consumer:', error);
    process.exit(1);
  }
}

// Example message that would be sent to the consumer
export const exampleVMCreateMessage = {
  type: 'vm.create' as const,
  data: {
    vmid: 1001,
    templateId: 9000,
    name: 'student-vm-001',
    node: 'pve-node-01',
    config: {
      cores: 2,
      memory: 2048,
      ipconfig0: 'ip=192.168.1.100/24,gw=192.168.1.1',
      ciuser: 'student',
      cipassword: 'password123',
      sshkeys: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC...'
    }
  },
  requestId: 'req-12345',
  userId: 'user-67890'
};

export const exampleVMDeleteMessage = {
  type: 'vm.delete' as const,
  data: {
    vmid: 1001,
    node: 'pve-node-01'
  },
  requestId: 'req-12346',
  userId: 'user-67890'
};

export const exampleVMResizeMessage = {
  type: 'vm.resize' as const,
  data: {
    vmid: 1001,
    node: 'pve-node-01',
    size: '+10G'
  },
  requestId: 'req-12347',
  userId: 'user-67890'
};

export const exampleVMStatusMessage = {
  type: 'vm.status' as const,
  data: {
    vmid: 1001,
    node: 'pve-node-01',
    state: 'start' as const
  },
  requestId: 'req-12348',
  userId: 'user-67890'
};

// Uncomment to start the consumer
// startConsumer();
