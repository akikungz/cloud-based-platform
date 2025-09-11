# Yuzu PVE API Flow Documentation

## Overview

This document describes the complete flow for creating and managing QEMU virtual machines and LXC containers using the Yuzu service's Proxmox Virtual Environment (PVE) API integration. The Yuzu service acts as a message consumer that processes VM management tasks asynchronously through RabbitMQ.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Momoi API     │    │   RabbitMQ      │    │   Yuzu Service  │
│   (Midori)      │───▶│   (Approval)    │───▶│   Message       │───▶│   Consumer      │
│                 │    │                 │    │   Queue         │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                                                              │
                                                                              ▼
                                                                      ┌─────────────────┐
                                                                      │   PVE API       │
                                                                      │   (Proxmox)     │
                                                                      └─────────────────┘
```

## Environment Configuration

### Required Environment Variables

```bash
# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=yuzu.exchange
RABBITMQ_QUEUE=yuzu.queue
RABBITMQ_ROUTING_KEY=yuzu.*

# Proxmox Configuration
PVE_API_TOKEN=your_pve_api_token
PVE_API_TOKEN_NAME=your_token_name
PVE_API_TOKEN_USER=your_username
PVE_API_URL=https://your-pve-server:8006/api2/json
PVE_NODES=node1,node2,node3

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/yuzu
```

## Message Types and Schemas

### 1. VM Create Message (`vm.create`)

Creates a new virtual machine from a template.

```typescript
interface VMCreateMessage {
  type: 'vm.create';
  data: {
    vmid: number;           // Target VM ID
    templateId: number;     // Source template ID
    name: string;           // VM hostname
    node: string;           // Target PVE node
    config?: {
      cores?: number;       // CPU cores
      memory?: number;      // Memory in MB
      diskSize?: string;    // Disk size change (e.g., "+10G", "+512M")
      ipconfig0?: string;   // Network configuration
      ciuser?: string;      // Cloud-init user
      cipassword?: string;  // Cloud-init password
      sshkeys?: string;     // SSH public keys
    };
  };
  requestId: string;        // Unique request identifier
  userId: string;           // User making the request
}
```

### 2. VM Delete Message (`vm.delete`)

Deletes an existing virtual machine.

```typescript
interface VMDeleteMessage {
  type: 'vm.delete';
  data: {
    vmid: number;           // VM ID to delete
    node: string;           // PVE node where VM is located
  };
  requestId: string;
  userId: string;
}
```

### 3. VM Resize Message (`vm.resize`)

Resizes a virtual machine's disk.

```typescript
interface VMResizeMessage {
  type: 'vm.resize';
  data: {
    vmid: number;           // VM ID to resize
    node: string;           // PVE node
    size: string;           // Size change (e.g., "+10G", "+512M")
  };
  requestId: string;
  userId: string;
}
```

### 4. VM Status Message (`vm.status`)

Changes the status of a virtual machine.

```typescript
interface VMStatusMessage {
  type: 'vm.status';
  data: {
    vmid: number;           // VM ID
    node: string;           // PVE node
    state: 'start' | 'stop' | 'suspend' | 'resume' | 'reboot';
  };
  requestId: string;
  userId: string;
}
```

## QEMU Virtual Machine Creation Flow

### Step 1: Clone from Template

The VM creation process starts by cloning from an existing template:

```typescript
// PVE API Endpoint: POST /nodes/:node/qemu/:vmid/clone
interface CloneQEMUProps {
  node: string;           // Target node
  vmid: number;           // Source template ID
  target: string;         // Target storage
  newid: number;          // New VM ID
  name: string;           // VM hostname
  full?: boolean;         // Full clone (vs linked clone)
}

const cloneResult = await qemu.clone({
  node: "pve-node-01",
  vmid: 9000,             // Template ID
  target: "local-lvm",
  newid: 1001,            // New VM ID
  name: "student-vm-001",
  full: true
});
```

### Step 2: Configure VM Settings

After cloning, configure the VM with specific settings:

```typescript
// PVE API Endpoint: POST /nodes/:node/qemu/:vmid/config
interface ConfigQEMUProps {
  node: string;
  vmid: number;
  // Network configuration
  ipconfig0?: string;     // Format: "ip=192.168.1.100/24,gw=192.168.1.1"
  net0?: string;          // Network interface configuration
  // Cloud-init configuration
  cicustom?: string;      // Custom cloud-init config
  ciuser?: string;        // Cloud-init user
  cipassword?: string;    // Cloud-init password
  sshkeys?: string;       // SSH public keys
  // Hardware configuration
  cores?: number;         // CPU cores
  memory?: number;        // Memory in MB
}

const configResult = await qemu.config({
  node: "pve-node-01",
  vmid: 1001,
  cores: 2,
  memory: 2048,
  ipconfig0: "ip=192.168.1.100/24,gw=192.168.1.1",
  ciuser: "student",
  cipassword: "password123",
  sshkeys: "ssh-rsa AAAAB3NzaC1yc2E...",
  cicustom: "user=cephfs:snippets/allow_ssh.yaml"
});
```

### Step 3: Resize Disk (Optional)

If the VM needs a different disk size than the template, resize the disk:

```typescript
// PVE API Endpoint: PUT /nodes/:node/qemu/:vmid/resize
interface ResizeQEMUProps {
  node: string;
  vmid: number;
  size: string;           // Size change (e.g., "+10G", "+512M", "+1024K")
}

const resizeResult = await qemu.resize({
  node: "pve-node-01",
  vmid: 1001,
  size: "+10G"            // Increase disk by 10GB
});
```

### Step 4: Start the VM

Start the newly created and configured VM:

```typescript
// PVE API Endpoint: POST /nodes/:node/qemu/:vmid/status/start
const startResult = await qemu.setStatusQEMU({
  node: "pve-node-01",
  vmid: 1001,
  state: "start"
});
```

### Step 5: Monitor Task Completion

Monitor the PVE task to ensure successful completion:

```typescript
// PVE API Endpoint: GET /nodes/:node/tasks/:upid/status
const taskStatus = await task_status("pve-node-01", cloneResult.data);
// Returns "OK" when task completes successfully
```

## LXC Container Creation Flow

### Step 1: Clone LXC Template

```typescript
// PVE API Endpoint: POST /nodes/:node/lxc/:vmid/clone
interface CloneLXCProps {
  node: string;
  vmid: number;           // Source template ID
  newid: number;          // New container ID
  name: string;           // Container hostname
  target?: string;        // Target storage
}

const cloneResult = await lxc.clone({
  node: "pve-node-01",
  vmid: 9001,             // LXC template ID
  newid: 2001,            // New container ID
  name: "student-lxc-001",
  target: "local-lvm"
});
```

### Step 2: Configure LXC Container

```typescript
// PVE API Endpoint: PUT /nodes/:node/lxc/:vmid/config
interface ConfigLXCProps {
  node: string;
  vmid: number;
  // Hardware configuration
  cores?: number;         // CPU cores
  memory?: number;        // Memory in MB
  swap?: number;          // Swap memory in MB
  // Network configuration
  net0?: string;          // Network configuration
}

const configResult = await lxc.config({
  node: "pve-node-01",
  vmid: 2001,
  cores: 1,
  memory: 1024,
  swap: 512,
  net0: "name=eth0,bridge=vmbr0,ip=192.168.1.101/24,gw=192.168.1.1"
});
```

### Step 3: Start LXC Container

```typescript
// PVE API Endpoint: POST /nodes/:node/lxc/:vmid/status/start
const startResult = await lxc.setStatusLXC({
  node: "pve-node-01",
  vmid: 2001,
  state: "start"
});
```

## Complete Implementation Example

Here's a complete example of how the VM creation flow is implemented in the message handler:

```typescript
export class VMMessageHandler implements MessageHandler {
  async handle(message: VMMessage): Promise<void> {
    console.log(`Processing message: ${message.type}`, { 
      requestId: message.requestId, 
      userId: message.userId 
    });

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
    const { vmid, templateId, name, node, config } = message.data;
    
    try {
      // Step 1: Clone from template
      console.log(`Cloning VM ${vmid} from template ${templateId}`);
      const cloneResult = await qemu.clone({
        node,
        vmid: templateId,
        target: "local-lvm",
        newid: vmid,
        name,
        full: true
      });

      // Step 2: Wait for clone to complete
      await task_status(node, cloneResult.data);

      // Step 3: Configure VM if config provided
      if (config) {
        console.log(`Configuring VM ${vmid}`);
        await qemu.config({
          node,
          vmid,
          ...config,
          cicustom: "user=cephfs:snippets/allow_ssh.yaml"
        });
      }

      // Step 4: Resize disk if specified
      if (config?.diskSize) {
        console.log(`Resizing disk for VM ${vmid} by ${config.diskSize}`);
        await qemu.resize({
          node,
          vmid,
          size: config.diskSize
        });
      }

      // Step 5: Start the VM
      console.log(`Starting VM ${vmid}`);
      await qemu.setStatusQEMU({
        node,
        vmid,
        state: "start"
      });

      // Step 6: Update database with VM status
      // TODO: Update database with successful creation
      
      console.log(`Successfully created VM ${vmid}`);
    } catch (error) {
      console.error(`Failed to create VM ${vmid}:`, error);
      // TODO: Update database with error status
      throw error;
    }
  }
}
```

## PVE API Endpoints Reference

### QEMU Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/nodes/:node/qemu` | List all QEMU VMs on a node |
| GET | `/nodes/:node/qemu/:vmid` | Get specific QEMU VM details |
| DELETE | `/nodes/:node/qemu/:vmid` | Delete a QEMU VM |
| GET | `/nodes/:node/qemu/:vmid/status/current` | Get VM status |
| POST | `/nodes/:node/qemu/:vmid/status/:state` | Change VM state (start/stop/suspend/resume/reboot) |
| POST | `/nodes/:node/qemu/:vmid/clone` | Clone a QEMU VM |
| POST/PUT | `/nodes/:node/qemu/:vmid/config` | Configure QEMU VM |
| PUT | `/nodes/:node/qemu/:vmid/resize` | Resize QEMU disk |

### LXC Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/nodes/:node/lxc` | List all LXC containers on a node |
| GET | `/nodes/:node/lxc/:vmid` | Get specific LXC container details |
| DELETE | `/nodes/:node/lxc/:vmid` | Delete an LXC container |
| GET | `/nodes/:node/lxc/:vmid/status/current` | Get container status |
| POST | `/nodes/:node/lxc/:vmid/status/:state` | Change container state |
| POST | `/nodes/:node/lxc/:vmid/clone` | Clone an LXC container |
| PUT | `/nodes/:node/lxc/:vmid/config` | Configure LXC container |
| PUT | `/nodes/:node/lxc/:vmid/resize` | Resize LXC disk |

### Task Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/nodes/:node/tasks/:upid/status` | Monitor task completion |

## Error Handling

### Common Error Scenarios

1. **Template Not Found**: When the source template ID doesn't exist
2. **VM ID Conflict**: When the target VM ID is already in use
3. **Insufficient Resources**: When the node doesn't have enough resources
4. **Network Configuration Errors**: Invalid IP addresses or network settings
5. **Storage Issues**: When target storage is full or unavailable

### Error Response Format

```typescript
interface ErrorResponse {
  data: null;
  message: string;
}
```

### Task Status Monitoring

The `task_status` function polls the PVE API every second until a task completes:

```typescript
export const task_status = async (node: string, upid: string) =>
  new Promise<string>((resolve, reject) => {
    const interval = setInterval(async () => {
      const { data: task } = await instance({
        path: "/nodes/:node/tasks/:upid/status",
        method: "GET",
        params: { node, upid },
      });

      if (task.data.status === "stopped") {
        clearInterval(interval);
        if (task.data.exitstatus) {
          if (task.data.exitstatus !== "OK") {
            return reject(task.data.exitstatus);
          }
          return resolve(task.data.exitstatus);
        }
        return reject("<unknown>");
      }
    }, 1000);
  });
```

## Best Practices

### 1. Resource Management
- Always check node capacity before creating VMs
- Use appropriate VM sizing based on workload requirements
- Monitor resource usage and implement cleanup policies
- Consider disk resize requirements when templates have insufficient storage
- Use relative disk sizes (e.g., "+10G") for flexibility across different template sizes

### 2. Network Configuration
- Use consistent IP addressing schemes
- Configure proper firewall rules
- Implement network isolation for security

### 3. Security
- Use SSH keys instead of passwords when possible
- Implement proper access controls
- Regular security updates for templates

### 4. Monitoring
- Monitor task completion status
- Log all operations for audit trails
- Implement health checks for created VMs

### 5. Error Recovery
- Implement retry mechanisms for transient failures
- Clean up failed resources
- Provide meaningful error messages to users

## Approval Flow Integration

### Instance Request Approval Process

When a staff member approves an instance request through the Momoi API, the system automatically sends a VM creation message to the RabbitMQ queue. Here's how the flow works:

1. **Staff Approval**: Staff member approves a request via the frontend
2. **Database Update**: Request state is updated to "approved" in the database
3. **Message Publishing**: VM creation message is automatically sent to RabbitMQ
4. **VM Creation**: Yuzu service consumes the message and creates the VM

### Momoi Service Integration

The Momoi service includes a RabbitMQ publisher that automatically sends VM creation messages when requests are approved:

```typescript
// In apps/momoi/src/core/v1/staff/approval/approval.service.ts
public static async approveRequest({ request_id }: { request_id: number }, staff_id: number) {
  // 1. Get request details
  const request = await this.db.instance_request.findFirst({
    where: { id: request_id, /* permission checks */ },
    include: { template: true, user: true, course: true }
  });

  // 2. Update request state to approved
  const approvedRequest = await this.db.instance_request.update({
    where: { id: request_id },
    data: { state: "approved" }
  });

  // 3. Send VM creation message to queue
  const publisher = await getRabbitMQPublisher();
  await publisher.publishVMCreateMessage({
    vmid: 1000 + request_id,           // Generated VM ID
    templateId: request.template_id,   // Source template
    name: request.hostname,            // VM hostname
    node: "pve-node-01",              // Target PVE node
    config: {
      cores: request.cpus,
      memory: request.memory,
      diskSize: `+${request.disk}G`,   // Disk size increase
      ciuser: request.user.name?.toLowerCase().replace(/\s+/g, '') || 'student',
      cipassword: 'defaultPassword123'
    },
    requestId: `req-${request_id}`,
    userId: request.user_id
  });

  return approvedRequest;
}
```

### Environment Configuration for Momoi

The Momoi service requires the following RabbitMQ environment variables:

```bash
# RabbitMQ Configuration for Momoi
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=yuzu.exchange
RABBITMQ_QUEUE=yuzu.queue
RABBITMQ_ROUTING_KEY=yuzu.create
```

## Message Queue Integration

### Publishing Messages

To create a VM, publish a message to the RabbitMQ queue:

```typescript
const message = {
  type: 'vm.create',
  data: {
    vmid: 1001,
    templateId: 9000,
    name: 'student-vm-001',
    node: 'pve-node-01',
    config: {
      cores: 2,
      memory: 2048,
      diskSize: '+10G',                    // Increase disk by 10GB
      ipconfig0: 'ip=192.168.1.100/24,gw=192.168.1.1',
      ciuser: 'student',
      cipassword: 'password123'
    }
  },
  requestId: 'req-12345',
  userId: 'user-67890'
};

await channel.publish('yuzu.exchange', 'yuzu.create', Buffer.from(JSON.stringify(message)));
```

### Consumer Setup

The Yuzu service consumes messages from the queue and processes them:

```typescript
// In apps/yuzu/src/consumer/index.ts
const consumer = new RabbitMQConsumer({
  url: env.RABBITMQ_URL,
  exchange: env.RABBITMQ_EXCHANGE,
  queue: env.RABBITMQ_QUEUE,
  routingKey: env.RABBITMQ_ROUTING_KEY
});

const messageHandler = new VMMessageHandler();
await consumer.start(messageHandler);
```

## Conclusion

This documentation provides a comprehensive guide for implementing QEMU and LXC instance creation using the Yuzu PVE API. The flow involves message-based communication through RabbitMQ, with the Yuzu service acting as a consumer that translates high-level operations into PVE API calls.

Key points to remember:
- Always monitor task completion using the task status endpoint
- Implement proper error handling and cleanup
- Use appropriate resource sizing and network configuration
- Follow security best practices for VM creation
- Maintain audit logs for all operations

For more detailed implementation examples, refer to the source code in the `apps/yuzu/src/libs/pve/` directory.
