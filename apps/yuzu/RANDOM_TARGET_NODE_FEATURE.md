# Random Target Node Feature

## Overview

The performance testing tool now supports **random target node selection** for each clone operation. This allows you to test clone performance across multiple nodes in your Proxmox VE cluster.

## Use Cases

### 1. **Multi-Node Performance Testing**
Test how clone operations perform when distributed across different nodes in your cluster.

### 2. **Load Balancing Simulation**
Simulate real-world scenarios where VMs are distributed across multiple nodes.

### 3. **Network Performance Analysis**
Compare same-node vs cross-node clone performance to understand network impact.

### 4. **Cluster Health Testing**
Verify that all nodes in your cluster can handle clone operations efficiently.

## Configuration Options

### Option 1: Specific Target Node (Original Behavior)
Use a single target node for all clones:
```bash
--target-node pve-node-1
```

### Option 2: Random from Provided List
Randomly select from a specific list of nodes:
```bash
--target-nodes pve-node-1,pve-node-2,pve-node-3
```

### Option 3: Random from Database
Automatically fetch and randomly select from all available nodes in the database:
```bash
--random-target
```

## Examples

### Test Across Specific Nodes
```bash
bun run performance-test.ts \
  --template-vmid 9000 \
  --template-node pve-node-1 \
  --target-nodes pve-node-1,pve-node-2,pve-node-3 \
  --start-vmid 10000 \
  --linked 15 \
  --full 15
```

This will:
- Run 15 linked clone tests
- Run 15 full clone tests
- Each test randomly selects from: pve-node-1, pve-node-2, or pve-node-3
- Total of 30 tests distributed across 3 nodes

### Test Across All Available Nodes
```bash
bun run performance-test.ts \
  --template-vmid 9000 \
  --template-node pve-node-1 \
  --random-target \
  --start-vmid 10000 \
  --linked 20 \
  --full 20
```

This will:
- Fetch all available nodes from the database
- Run 20 linked clone tests
- Run 20 full clone tests
- Each test randomly selects from all available nodes
- Total of 40 tests distributed across all cluster nodes

## Implementation Details

### How It Works

1. **Node Selection**:
   - If `--target-nodes` is provided: Uses the specified list
   - If `--random-target` is provided: Fetches nodes from database
   - For each test: Randomly selects one node from the available list

2. **Database Query**:
   ```typescript
   const nodes = await db.pve_node.findMany({
     where: { deleted_at: null },
     select: { name: true }
   });
   ```

3. **Random Selection**:
   ```typescript
   const randomIndex = Math.floor(Math.random() * availableNodes.length);
   return availableNodes[randomIndex];
   ```

4. **Tracking**:
   - Each test result includes the target node used
   - Results can be analyzed per-node or overall

### Code Changes

#### CloneTestConfig Interface
```typescript
export interface CloneTestConfig {
  templateVmid: number;
  templateNode: string;
  targetNode?: string; // Optional: if not provided, will use random
  targetNodes?: string[]; // Optional: array of nodes to randomly select from
  startVmid: number;
  linkedCloneCount: number;
  fullCloneCount: number;
  cleanupAfterTest?: boolean;
  delayBetweenTests?: number;
  randomTargetNode?: boolean; // If true, randomly select from database
}
```

#### CloneTestResult Interface
```typescript
export interface CloneTestResult {
  testId: string;
  vmid: number;
  newid: number;
  cloneType: 'linked' | 'full';
  targetNode: string; // Now tracks which node was used
  duration: number;
  success: boolean;
  error?: string;
}
```

## Analysis Capabilities

### Per-Node Performance
You can analyze results to see performance differences between nodes:

```typescript
const results = test.getResults();

// Group by target node
const byNode = results.reduce((acc, r) => {
  if (!acc[r.targetNode]) acc[r.targetNode] = [];
  acc[r.targetNode].push(r);
  return acc;
}, {});

// Calculate average per node
Object.entries(byNode).forEach(([node, nodeResults]) => {
  const avg = nodeResults.reduce((sum, r) => sum + r.duration, 0) / nodeResults.length;
  console.log(`${node}: ${(avg / 1000).toFixed(2)}s average`);
});
```

### Same-Node vs Cross-Node
Compare performance when cloning to the same node vs different nodes:

```typescript
const sameNode = results.filter(r => r.targetNode === templateNode);
const crossNode = results.filter(r => r.targetNode !== templateNode);

console.log(`Same-node average: ${calculateAverage(sameNode)}s`);
console.log(`Cross-node average: ${calculateAverage(crossNode)}s`);
```

## Benefits

1. **Realistic Testing**: Simulates real-world VM distribution
2. **Performance Insights**: Identifies slow nodes or network bottlenecks
3. **Load Distribution**: Tests how cluster handles distributed operations
4. **Flexibility**: Choose between specific nodes or all available nodes
5. **Comprehensive Data**: Collect performance data across entire cluster

## Logging

The tool logs which node is selected for each test:

```
[INFO] Test 1: Selected target node: pve-node-2
[INFO] Starting linked clone test
[INFO] Clone task started: UPID:pve-node-1:...
[INFO] Clone test completed successfully: 12.34s

[INFO] Test 2: Selected target node: pve-node-1
[INFO] Starting linked clone test
[INFO] Clone task started: UPID:pve-node-1:...
[INFO] Clone test completed successfully: 8.45s
```

## CSV Export with Node Information

The CSV export now includes the target node for each test:

```csv
Operation,Clone Type,VMID,New ID,Node,Target,Duration (ms),Duration (s),Status,Error,Timestamp
clone,linked,9000,10000,pve-node-1,pve-node-2,12340.00,12.34,completed,,2025-10-03T07:05:43.000Z
clone,linked,9000,10001,pve-node-1,pve-node-1,8450.00,8.45,completed,,2025-10-03T07:05:55.000Z
clone,full,9000,10002,pve-node-1,pve-node-3,45780.00,45.78,completed,,2025-10-03T07:06:10.000Z
```

## Validation

The tool validates that:
1. At least one target node option is provided
2. If using `--target-nodes`, the list is not empty
3. If using `--random-target`, at least one node exists in database
4. Each selected node is valid before running the test

## Error Handling

If no nodes are available:
```
Error: No available nodes found for random selection
```

If target node configuration is missing:
```
Error: Must specify either --target-node, --target-nodes, or --random-target
```

## Future Enhancements

Potential improvements for this feature:

1. **Weighted Random Selection**: Prioritize certain nodes based on capacity
2. **Round-Robin Distribution**: Ensure even distribution across nodes
3. **Node Health Checks**: Skip unhealthy nodes automatically
4. **Per-Node Reports**: Generate separate reports for each node
5. **Geographic Distribution**: Consider node location in selection
