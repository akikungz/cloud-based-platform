# Yuzu VM Operations

This document describes the VM operations functionality implemented in the Yuzu service, which handles creating, managing, and deleting virtual machines in Proxmox VE (PVE) through RabbitMQ messages.

## Overview

The Yuzu service acts as a consumer that receives messages from RabbitMQ and performs VM operations in PVE. It integrates with the database to track instance states and manages IP address assignments.

## Architecture

```
RabbitMQ → Yuzu Consumer → PVE API → Database
```

1. **RabbitMQ**: Message queue for VM operation requests
2. **Yuzu Consumer**: Processes messages and coordinates VM operations
3. **PVE API**: Proxmox VE API for actual VM management
4. **Database**: Tracks instance states, IP assignments, and metadata

## Supported Operations

### 1. VM Creation (`vm.create`)

Creates a new VM by cloning from a template and configuring it.

**Message Format:**
```json
{
  "type": "vm.create",
  "data": {
    "vmid": 1001,
    "templateId": 900,
    "name": "student-vm-001",
    "node": "pve-node-01",
    "config": {
      "cores": 2,
      "memory": 4096,
      "diskSize": "20G",
      "ipconfig0": "ip=192.168.1.100/24,gw=192.168.1.1",
      "ciuser": "student",
      "cipassword": "securepassword123",
      "sshkeys": "ssh-rsa AAAAB3NzaC1yc2E..."
    }
  },
  "requestId": "req-123",
  "userId": "user-456"
}
```

**Process:**
1. Validates the request exists and is approved
2. Creates instance record in database
3. Clones VM from template in PVE
4. Configures VM settings (CPU, memory, cloud-init)
5. Starts the VM
6. Assigns random available IP address
7. Configures network interface based on assigned IP's network
8. Updates database with success status

**Network Interface Configuration:**
- **Automatic**: If no `net0` or `ipconfig0` specified, system automatically configures network interface based on assigned IP's network
- **Manual**: User can specify `net0` and `ipconfig0` to override automatic configuration
- **Bridge Configuration**: Uses network name from database as bridge name in PVE
- **IP Configuration**: Automatically sets IP, subnet mask, and gateway based on assigned IP and network information

**Network Configuration Examples:**

*Automatic Configuration:*
```json
{
  "type": "vm.create",
  "data": {
    "vmid": 1001,
    "templateId": 900,
    "name": "student-vm-001",
    "node": "pve-node-01",
    "config": {
      "cores": 2,
      "memory": 4096
      // net0 and ipconfig0 configured automatically
    }
  }
}
```

*Manual Configuration:*
```json
{
  "type": "vm.create",
  "data": {
    "vmid": 1002,
    "templateId": 900,
    "name": "staff-vm-001",
    "node": "pve-node-01",
    "config": {
      "cores": 4,
      "memory": 8192,
      "net0": "model=virtio,bridge=staff-network",
      "ipconfig0": "ip=10.0.1.50/24,gw=10.0.1.1"
    }
  }
}
```

### 2. VM Deletion (`vm.delete`)

Deletes a VM from PVE and marks it as deleted in the database.

**Message Format:**
```json
{
  "type": "vm.delete",
  "data": {
    "vmid": 1001,
    "node": "pve-node-01"
  },
  "requestId": "req-124",
  "userId": "user-456"
}
```

**Process:**
1. Finds instance in database
2. Stops VM if running
3. Deletes VM from PVE
4. Releases assigned IP address
5. Marks instance as deleted in database

### 3. VM Resize (`vm.resize`)

Resizes the disk of an existing VM with intelligent size calculation based on template base size.

**Message Format (Total Resize - User wants specific total size):**
```json
{
  "type": "vm.resize",
  "data": {
    "vmid": 1001,
    "node": "pve-node-01",
    "size": 8,
    "resizeType": "total"
  },
  "requestId": "req-125",
  "userId": "user-456"
}
```

**Message Format (Add Resize - Add specific amount):**
```json
{
  "type": "vm.resize",
  "data": {
    "vmid": 1001,
    "node": "pve-node-01",
    "size": 4.5,
    "resizeType": "add"
  },
  "requestId": "req-125",
  "userId": "user-456"
}
```

**Process:**
1. Finds instance in database with template information
2. Calculates new disk size based on resize type and template base size
3. Validates new size against constraints (template base size, maximum limits)
4. Resizes disk in PVE using calculated size difference
5. Updates disk size in database

**Resize Types:**
- **Total**: User specifies desired total disk size (e.g., 8GB total)
- **Add**: User specifies amount to add to current size (e.g., +4.5GB)

**Validation Rules:**
- New size must be greater than current size
- New size cannot be less than template base size
- New size cannot exceed maximum limit (1024GB)

**Resize Calculation Examples:**

*Scenario 1: Total Resize (User wants specific total size)*
- Current disk size: 3.5GB
- Template base size: 3.5GB
- User request: 8GB total
- Result: 8GB total
- PVE command: +4.5G (8GB - 3.5GB = 4.5GB to add)

*Scenario 2: Add Resize (User wants to add specific amount)*
- Current disk size: 3.5GB
- Template base size: 3.5GB
- User request: +4.5GB (add)
- Result: 3.5GB + 4.5GB = 8GB total
- PVE command: +4.5G

*Scenario 3: Decimal Size Support*
- Current disk size: 10.5GB
- Template base size: 10GB
- User request: 15.75GB total
- Result: 15.75GB total
- PVE command: +5.25G (15.75GB - 10.5GB = 5.25GB to add)

*Scenario 4: Validation Error*
- Current disk size: 3.5GB
- Template base size: 3.5GB
- User request: 2GB total
- Result: ERROR - Cannot resize below template base size (3.5GB)

### 4. VM Status Change (`vm.status`)

Changes the power state of a VM (start, stop, suspend, resume, reboot).

**Message Format:**
```json
{
  "type": "vm.status",
  "data": {
    "vmid": 1001,
    "node": "pve-node-01",
    "state": "start"
  },
  "requestId": "req-126",
  "userId": "user-456"
}
```

**Process:**
1. Finds instance in database
2. Changes VM state in PVE
3. Updates status in database

## Database Integration

### Instance Table Updates

The service updates the `instance` table with:
- VM creation status (`pending` → `running`)
- VM deletion (marks as `deleted`)
- Status changes (`running` ↔ `stopped`)
- IP address assignments
- Timestamps for all operations

### IP Address Management

- **Random IP Selection**: Automatically assigns random available IP addresses during VM creation for better load distribution
- **Network Preference**: Supports preferred network selection with fallback to any available network
- **IP Release**: Automatically releases IP addresses when VMs are deleted
- **Usage Tracking**: Tracks IP usage in the `ip_address` table with proper state management

**Random IP Selection Algorithm:**
1. Count available IP addresses in the target network (or all networks if no preference)
2. Generate a random offset between 0 and (count - 1)
3. Use database skip/take to select the IP at the random offset
4. Log the selection for transparency and debugging
5. Fallback to any available network if preferred network has no available IPs

## Error Handling

- **Graceful Degradation**: IP assignment failures don't prevent VM creation
- **Status Tracking**: Failed operations update instance status to `stopped`
- **Retry Logic**: RabbitMQ handles message retries on failures
- **Logging**: Comprehensive logging for debugging and monitoring

## Configuration

### Environment Variables

Required environment variables for PVE integration:
- `PVE_API_URL`: Proxmox VE API endpoint
- `PVE_API_TOKEN_USER`: PVE API token user
- `PVE_API_TOKEN_NAME`: PVE API token name
- `PVE_API_TOKEN`: PVE API token value

### RabbitMQ Configuration

Default configuration in `rabbitmq.ts`:
- Exchange: `vm.operations`
- Queue: `yuzu.vm.operations`
- Routing Key: `vm.*`

## Usage

### Starting the Consumer

```bash
# From the yuzu directory
bun run index.ts
```

### Sending Messages

Messages are typically sent from the momoi service when:
- A request is approved (triggers VM creation)
- A user requests VM deletion
- VM resizing is needed
- Status changes are required

### Example Integration

```typescript
import { sendVMCreateMessage } from './src/consumer/example-usage';

// When a request is approved in momoi
const message = {
  type: 'vm.create',
  data: {
    vmid: 1001,
    templateId: 900,
    name: 'student-vm-001',
    node: 'pve-node-01',
    config: { /* ... */ }
  },
  requestId: 'req-123',
  userId: 'user-456'
};

sendVMCreateMessage(rabbitMQChannel, message);
```

## Monitoring

The service provides comprehensive logging for:
- Message processing status
- PVE API operations
- Database updates
- Error conditions
- Performance metrics

## Security Considerations

- All PVE API calls use token-based authentication
- Database operations use parameterized queries
- IP address assignments prevent conflicts
- User permissions are validated through request approval process

## Future Enhancements

Potential improvements:
- VM backup and restore operations
- Resource monitoring and alerts
- Automated scaling based on usage
- Integration with monitoring systems
- Support for LXC containers
- Template management automation
