# Yuzu RabbitMQ Consumer Setup

This document explains how to set up and use the RabbitMQ consumer in the Yuzu service for handling virtual machine operations.

## Overview

The Yuzu RabbitMQ consumer is designed to process virtual machine management tasks asynchronously. It listens to messages from RabbitMQ and performs operations on Proxmox Virtual Environment (PVE) based on the received commands.

## Features

- **Asynchronous Processing**: Handles VM operations in the background
- **Message Validation**: Uses Zod schemas to validate incoming messages
- **Error Handling**: Proper error handling with message requeuing
- **Graceful Shutdown**: Handles SIGINT and SIGTERM signals
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=yuzu.exchange
RABBITMQ_QUEUE=yuzu.queue
RABBITMQ_ROUTING_KEY=yuzu.*

# Proxmox Configuration (existing)
PVE_API_TOKEN=your_pve_api_token
PVE_API_TOKEN_NAME=your_token_name
PVE_API_TOKEN_USER=your_username
PVE_API_URL=https://your-pve-server:8006/api2/json
PVE_NODES=node1,node2,node3

# Database Configuration (existing)
DATABASE_URL=postgresql://user:password@localhost:5432/yuzu
```

## Message Types

The consumer supports the following message types:

### 1. VM Create (`vm.create`)
Creates a new virtual machine from a template.

```json
{
  "type": "vm.create",
  "data": {
    "vmid": 1001,
    "templateId": 9000,
    "name": "student-vm-001",
    "node": "pve-node-01",
    "config": {
      "cores": 2,
      "memory": 2048,
      "ipconfig0": "ip=192.168.1.100/24,gw=192.168.1.1",
      "ciuser": "student",
      "cipassword": "password123",
      "sshkeys": "ssh-rsa AAAAB3NzaC1yc2E..."
    }
  },
  "requestId": "req-12345",
  "userId": "user-67890"
}
```

### 2. VM Delete (`vm.delete`)
Deletes an existing virtual machine.

```json
{
  "type": "vm.delete",
  "data": {
    "vmid": 1001,
    "node": "pve-node-01"
  },
  "requestId": "req-12346",
  "userId": "user-67890"
}
```

### 3. VM Resize (`vm.resize`)
Resizes the disk of a virtual machine.

```json
{
  "type": "vm.resize",
  "data": {
    "vmid": 1001,
    "node": "pve-node-01",
    "size": "+10G"
  },
  "requestId": "req-12347",
  "userId": "user-67890"
}
```

### 4. VM Status (`vm.status`)
Changes the status of a virtual machine (start, stop, suspend, resume, reboot).

```json
{
  "type": "vm.status",
  "data": {
    "vmid": 1001,
    "node": "pve-node-01",
    "state": "start"
  },
  "requestId": "req-12348",
  "userId": "user-67890"
}
```

## Running the Consumer

### Development
```bash
cd apps/yuzu
bun run index.ts
```

### Production
```bash
cd apps/yuzu
bun run index.ts
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Momoi API     │───▶│   RabbitMQ      │───▶│  Yuzu Consumer  │
│   (Backend)     │    │   (Message      │    │  (VM Manager)   │
│                 │    │    Broker)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │   Proxmox VE    │
                                               │   (Hypervisor)  │
                                               └─────────────────┘
```

## Implementation Status

### ✅ Completed
- RabbitMQ connection and channel management
- Message parsing and validation
- Basic message handler structure
- Environment configuration
- TypeScript type definitions
- Graceful shutdown handling

### 🚧 TODO
- Implement actual PVE API calls in message handlers
- Add database integration for VM state tracking
- Implement retry logic for failed operations
- Add monitoring and logging
- Add health check endpoints
- Implement message acknowledgment strategies

## Development

### Adding New Message Types

1. Add the message schema to `message-handlers.ts`:
```typescript
export const NewMessageSchema = z.object({
  type: z.literal('new.type'),
  data: z.object({
    // your data structure
  }),
  requestId: z.string(),
  userId: z.string(),
});
```

2. Add the handler method to `VMMessageHandler`:
```typescript
private async handleNewMessage(message: NewMessage): Promise<void> {
  // Implementation
}
```

3. Update the switch statement in the `handle` method.

### Testing

You can test the consumer by sending messages to RabbitMQ using the management interface or a simple publisher script.

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check if RabbitMQ is running and accessible
2. **Authentication Failed**: Verify RabbitMQ credentials
3. **Message Validation Errors**: Check message format against schemas
4. **PVE API Errors**: Verify Proxmox configuration and credentials

### Logs

The consumer provides detailed logging for:
- Connection status
- Message processing
- Error handling
- PVE API interactions

## Security Considerations

- Use secure RabbitMQ credentials
- Validate all incoming messages
- Implement proper error handling to prevent message loss
- Consider message encryption for sensitive data
- Use secure connections (AMQPS) in production
