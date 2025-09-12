/**
 * Examples demonstrating the improved VM resize functionality
 * Shows how to properly calculate disk sizes based on template base_size
 */

import type { VMResizeMessage } from './message-handlers';

/**
 * Example 1: Total Resize (User specifies desired total size)
 * This sets the total disk size to the specified value
 */
export const totalResizeExamples: VMResizeMessage[] = [
  {
    type: 'vm.resize',
    data: {
      vmid: 1001,
      node: 'pve-node-01',
      size: 8, // User wants 8GB total disk size
      resizeType: 'total'
    },
    requestId: 'req-resize-001',
    userId: 'user-456'
  },
  {
    type: 'vm.resize',
    data: {
      vmid: 1001,
      node: 'pve-node-01',
      size: '12.5', // User wants 12.5GB total disk size (string format)
      resizeType: 'total'
    },
    requestId: 'req-resize-002',
    userId: 'user-456'
  }
];

/**
 * Example 2: Add Resize (Add specific amount to current size)
 * This adds the specified amount to the current disk size
 */
export const addResizeExamples: VMResizeMessage[] = [
  {
    type: 'vm.resize',
    data: {
      vmid: 1001,
      node: 'pve-node-01',
      size: 4.5, // Add 4.5GB to current size
      resizeType: 'add'
    },
    requestId: 'req-resize-003',
    userId: 'user-456'
  },
  {
    type: 'vm.resize',
    data: {
      vmid: 1001,
      node: 'pve-node-01',
      size: '+2.5G', // Add 2.5GB to current size (string format)
      resizeType: 'add'
    },
    requestId: 'req-resize-004',
    userId: 'user-456'
  }
];

/**
 * Example calculation scenarios
 */
export function demonstrateResizeCalculations() {
  console.log(`
VM Resize Calculation Examples:

Scenario 1: Total Resize (User wants specific total size)
- Current disk size: 3.5GB
- Template base size: 3.5GB
- User request: 8GB total
- Result: 8GB total
- PVE command: +4.5G (8GB - 3.5GB = 4.5GB to add)

Scenario 2: Add Resize (User wants to add specific amount)
- Current disk size: 3.5GB
- Template base size: 3.5GB
- User request: +4.5GB (add)
- Result: 3.5GB + 4.5GB = 8GB total
- PVE command: +4.5G

Scenario 3: Decimal Size Support
- Current disk size: 10.5GB
- Template base size: 10GB
- User request: 15.75GB total
- Result: 15.75GB total
- PVE command: +5.25G (15.75GB - 10.5GB = 5.25GB to add)

Scenario 4: Validation Example
- Current disk size: 3.5GB
- Template base size: 3.5GB
- User request: 2GB total
- Result: ERROR - Cannot resize below template base size (3.5GB)

Scenario 5: Maximum Size Validation
- Current disk size: 30GB
- Template base size: 20GB
- User request: 2000GB total
- Result: ERROR - Exceeds maximum allowed size (1024GB)
  `);
}

/**
 * Example of the resize process flow
 */
export function demonstrateResizeProcess() {
  console.log(`
VM Resize Process Flow:

1. Message Validation:
   - Validate resize message format
   - Check resize type (relative/absolute)
   - Parse size value (string or number)

2. Database Query:
   - Find instance with VM ID and node
   - Include template information for base_size
   - Verify instance exists and is not deleted

3. Size Calculation:
   - Calculate new disk size based on resize type
   - Validate against template base_size
   - Validate against maximum limits
   - Generate PVE resize command

4. PVE Operation:
   - Execute disk resize in Proxmox VE
   - Wait for resize task completion
   - Monitor task status

5. Database Update:
   - Update instance disk size
   - Update timestamp
   - Log success

6. Error Handling:
   - Rollback on PVE operation failure
   - Validate size constraints
   - Provide clear error messages
  `);
}

/**
 * Example validation rules
 */
export function demonstrateValidationRules() {
  console.log(`
VM Resize Validation Rules:

1. Size Constraints:
   - New size must be greater than current size
   - New size cannot be less than template base_size
   - New size cannot exceed maximum limit (1024GB)

2. Input Format Support:
   - Relative: "+10G", "10G", 10 (number)
   - Absolute: "50", 50 (number)

3. Template Base Size:
   - Ensures VM never goes below original template size
   - Prevents data loss from undersizing
   - Maintains system integrity

4. Error Messages:
   - Clear indication of validation failures
   - Suggests valid size ranges
   - Includes current and template sizes for context
  `);
}

/**
 * Example usage in different scenarios
 */
export function demonstrateUsageScenarios() {
  console.log(`
Usage Scenarios:

1. Student Requesting More Storage:
   - Current: 20GB (template base)
   - Request: +10GB (relative)
   - Result: 30GB total

2. Course Requirement:
   - Current: 30GB
   - Requirement: 50GB minimum
   - Request: 50GB (absolute)
   - Result: 50GB total

3. Gradual Expansion:
   - Current: 40GB
   - Request: +5GB (relative)
   - Result: 45GB total

4. Semester Reset:
   - Current: 100GB
   - Template base: 20GB
   - Request: 25GB (absolute)
   - Result: 25GB total (above template base)
  `);
}

// Export all examples and demonstrations
export const resizeExamples = {
  totalResizeExamples,
  addResizeExamples,
  demonstrateResizeCalculations,
  demonstrateResizeProcess,
  demonstrateValidationRules,
  demonstrateUsageScenarios
};
