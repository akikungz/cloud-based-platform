/**
 * Real-world example demonstrating the VM resize functionality
 * Based on the user's specific scenario: based_size is 3.5GB, user wants 8GB total
 */

import type { VMResizeMessage } from './message-handlers';

/**
 * Example: User has a VM with template base size of 3.5GB, current size is 3.5GB
 * User wants to resize to 8GB total
 */
export const realWorldResizeExample: VMResizeMessage = {
  type: 'vm.resize',
  data: {
    vmid: 1001,
    node: 'pve-node-01',
    size: 8, // User wants 8GB total disk size
    resizeType: 'total' // This means the user wants 8GB total, not add 8GB
  },
  requestId: 'req-real-world-001',
  userId: 'user-456'
};

/**
 * What happens when this message is processed:
 * 
 * 1. System finds the instance in database
 * 2. Gets template information: based_size = 3.5GB
 * 3. Gets current disk size: 3.5GB
 * 4. Calculates new size:
 *    - User wants: 8GB total
 *    - Current: 3.5GB
 *    - Difference: 8GB - 3.5GB = 4.5GB to add
 * 5. Validates:
 *    - 8GB > 3.5GB ✓ (greater than current)
 *    - 8GB >= 3.5GB ✓ (not less than template base)
 *    - 8GB <= 1024GB ✓ (within maximum limit)
 * 6. Executes PVE command: +4.5G
 * 7. Updates database: disk = 8GB
 * 
 * Result: VM now has 8GB total disk space
 */

/**
 * Alternative: User wants to add 4.5GB to current size
 */
export const addResizeExample: VMResizeMessage = {
  type: 'vm.resize',
  data: {
    vmid: 1001,
    node: 'pve-node-01',
    size: 4.5, // User wants to add 4.5GB
    resizeType: 'add' // This means add 4.5GB to current size
  },
  requestId: 'req-real-world-002',
  userId: 'user-456'
};

/**
 * What happens when this message is processed:
 * 
 * 1. System finds the instance in database
 * 2. Gets template information: based_size = 3.5GB
 * 3. Gets current disk size: 3.5GB
 * 4. Calculates new size:
 *    - Current: 3.5GB
 *    - Add: 4.5GB
 *    - New total: 3.5GB + 4.5GB = 8GB
 * 5. Validates:
 *    - 8GB > 3.5GB ✓ (greater than current)
 *    - 8GB >= 3.5GB ✓ (not less than template base)
 *    - 8GB <= 1024GB ✓ (within maximum limit)
 * 6. Executes PVE command: +4.5G
 * 7. Updates database: disk = 8GB
 * 
 * Result: VM now has 8GB total disk space (same result as above)
 */

/**
 * Example with decimal sizes
 */
export const decimalResizeExample: VMResizeMessage = {
  type: 'vm.resize',
  data: {
    vmid: 1001,
    node: 'pve-node-01',
    size: '8.5', // User wants 8.5GB total (string format)
    resizeType: 'total'
  },
  requestId: 'req-real-world-003',
  userId: 'user-456'
};

/**
 * What happens with decimal sizes:
 * 
 * 1. Current: 3.5GB
 * 2. User wants: 8.5GB total
 * 3. Difference: 8.5GB - 3.5GB = 5.0GB to add
 * 4. PVE command: +5G
 * 5. Result: 8.5GB total disk space
 */

/**
 * Validation error example
 */
export const validationErrorExample: VMResizeMessage = {
  type: 'vm.resize',
  data: {
    vmid: 1001,
    node: 'pve-node-01',
    size: 2, // User wants 2GB total (below template base size)
    resizeType: 'total'
  },
  requestId: 'req-real-world-004',
  userId: 'user-456'
};

/**
 * What happens with validation error:
 * 
 * 1. Current: 3.5GB
 * 2. Template base: 3.5GB
 * 3. User wants: 2GB total
 * 4. Validation fails: 2GB < 3.5GB (template base size)
 * 5. Error: "New disk size (2GB) cannot be less than template base size (3.5GB)"
 * 6. Operation cancelled, no changes made
 */

/**
 * Summary of the resize logic:
 * 
 * - 'total' resizeType: User specifies the desired total disk size
 * - 'add' resizeType: User specifies how much to add to current size
 * - System automatically calculates the difference for PVE commands
 * - Template base size is always respected as minimum
 * - Decimal sizes are fully supported
 * - Clear validation with helpful error messages
 */

export const examples = {
  realWorldResizeExample,
  addResizeExample,
  decimalResizeExample,
  validationErrorExample
};
