/**
 * Example demonstrating network interface configuration based on database network information
 * Shows how the system automatically configures network interfaces using network names from the database
 */

import type { VMCreateMessage } from './message-handlers';

/**
 * Example: VM creation with automatic network interface configuration
 */
export const networkConfigExample: VMCreateMessage = {
  type: 'vm.create',
  data: {
    vmid: 1001,
    templateId: 900,
    name: 'student-vm-001',
    node: 'pve-node-01',
    config: {
      cores: 2,
      memory: 4096,
      // net0 and ipconfig0 will be automatically configured based on assigned IP
    }
  },
  requestId: 'req-network-001',
  userId: 'user-456'
};

/**
 * What happens during network configuration:
 * 
 * 1. IP Assignment:
 *    - System randomly selects an available IP address
 *    - Example: 192.168.1.100 from network "student-network"
 * 
 * 2. Network Information Retrieval:
 *    - Gets network details from database:
 *      - name: "student-network"
 *      - network: "192.168.1.0/24"
 *      - gateway: "192.168.1.1"
 * 
 * 3. Network Interface Configuration:
 *    - net0: "model=virtio,bridge=student-network"
 *    - ipconfig0: "ip=192.168.1.100/24,gw=192.168.1.1"
 * 
 * 4. PVE Configuration:
 *    - Updates VM with network interface settings
 *    - Configures IP address and gateway
 *    - Sets up bridge connection
 */

/**
 * Example with manual network configuration (overrides automatic)
 */
export const manualNetworkConfigExample: VMCreateMessage = {
  type: 'vm.create',
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
    }
  },
  requestId: 'req-network-002',
  userId: 'user-789'
};

/**
 * Network configuration scenarios
 */
export function demonstrateNetworkScenarios() {
  console.log(`
Network Configuration Scenarios:

Scenario 1: Automatic Configuration
- User doesn't specify net0 or ipconfig0
- System assigns random IP from available pool
- Automatically configures network interface based on assigned IP's network
- Example: IP 192.168.1.100 → net0: "model=virtio,bridge=student-network"

Scenario 2: Manual Configuration
- User specifies both net0 and ipconfig0
- System uses user-provided network configuration
- No automatic IP assignment or network configuration
- Example: net0: "model=virtio,bridge=staff-network", ipconfig0: "ip=10.0.1.50/24,gw=10.0.1.1"

Scenario 3: Partial Configuration
- User specifies only net0 or only ipconfig0
- System fills in missing configuration automatically
- Combines user preferences with automatic assignment

Scenario 4: Network Preference
- User can specify preferred network for IP assignment
- System tries to assign IP from preferred network first
- Falls back to any available network if preferred network is full
  `);
}

/**
 * Database network table structure
 */
export function demonstrateDatabaseStructure() {
  console.log(`
Database Network Table Structure:

network table:
- id: Primary key
- name: Network name (used as bridge name in PVE)
- network: CIDR notation (e.g., "192.168.1.0/24")
- gateway: Gateway IP address
- created_at, updated_at, deleted_at: Timestamps

ip_address table:
- id: Primary key
- network_id: Foreign key to network table
- ip: IP address (e.g., "192.168.1.100")
- is_used: Boolean flag for availability
- created_at, updated_at, deleted_at: Timestamps

Example Network Records:
Network 1: { id: 1, name: "student-network", network: "192.168.1.0/24", gateway: "192.168.1.1" }
Network 2: { id: 2, name: "staff-network", network: "10.0.1.0/24", gateway: "10.0.1.1" }
Network 3: { id: 3, name: "guest-network", network: "172.16.1.0/24", gateway: "172.16.1.1" }
  `);
}

/**
 * PVE network configuration format
 */
export function demonstratePVEConfiguration() {
  console.log(`
PVE Network Configuration Format:

Network Interface (net0):
- Format: "model=virtio,bridge=<network_name>"
- model: Network adapter type (virtio for best performance)
- bridge: Bridge name (matches network.name from database)
- Example: "model=virtio,bridge=student-network"

IP Configuration (ipconfig0):
- Format: "ip=<ip_address>/<subnet_mask>,gw=<gateway>"
- ip: Assigned IP address
- subnet_mask: Extracted from network.network CIDR
- gw: Gateway from network.gateway
- Example: "ip=192.168.1.100/24,gw=192.168.1.1"

Combined Configuration:
- net0: "model=virtio,bridge=student-network"
- ipconfig0: "ip=192.168.1.100/24,gw=192.168.1.1"
- Result: VM connected to student-network bridge with static IP
  `);
}

/**
 * Network configuration process flow
 */
export function demonstrateConfigurationFlow() {
  console.log(`
Network Configuration Process Flow:

1. VM Creation Request:
   - User sends VM creation message
   - System validates request and creates instance record

2. IP Assignment:
   - System randomly selects available IP address
   - Marks IP as used in database
   - Assigns IP to instance record

3. Network Information Retrieval:
   - Gets network details using assigned IP's network_id
   - Retrieves network name, CIDR, and gateway
   - Validates network exists and is active

4. Network Interface Configuration:
   - Builds net0 configuration: "model=virtio,bridge=<network_name>"
   - Builds ipconfig0 configuration: "ip=<ip>/<subnet>,gw=<gateway>"
   - Logs configuration for debugging

5. PVE Configuration Update:
   - Calls PVE API to update VM network configuration
   - Waits for configuration task completion
   - Verifies successful network setup

6. VM Startup:
   - Starts VM with configured network interface
   - VM boots with static IP and network connectivity
   - Network interface ready for use
  `);
}

/**
 * Error handling scenarios
 */
export function demonstrateErrorHandling() {
  console.log(`
Network Configuration Error Handling:

Error 1: Network Not Found
- Assigned IP references non-existent network
- Error: "Network with ID X not found"
- VM creation continues without network configuration
- Manual network setup required

Error 2: PVE Configuration Failure
- Network configuration task fails in PVE
- Error logged with task details
- VM may start without proper network configuration
- Requires manual network setup

Error 3: Invalid Network Configuration
- Network name doesn't exist as bridge in PVE
- PVE rejects configuration
- Error logged with PVE response
- Fallback to default network configuration

Error 4: IP Assignment Failure
- No available IP addresses
- VM creation continues without IP assignment
- Network interface not configured
- Manual IP assignment required later
  `);
}

// Export all examples and demonstrations
export const networkConfigExamples = {
  networkConfigExample,
  manualNetworkConfigExample,
  demonstrateNetworkScenarios,
  demonstrateDatabaseStructure,
  demonstratePVEConfiguration,
  demonstrateConfigurationFlow,
  demonstrateErrorHandling
};
