# Clone Performance Testing

This module provides comprehensive performance testing tools for comparing **linked-clone** vs **full clone** operations in Proxmox VE.

## Features

- ⏱️ **Time Collection**: Accurate performance metrics collection using high-resolution timers
- 📊 **Detailed Reports**: Generate comprehensive reports with statistics and comparisons
- 🔄 **Automated Testing**: Run multiple tests with configurable parameters
- 🧹 **Auto Cleanup**: Automatically clean up test VMs after completion
- 📁 **Multiple Export Formats**: Export results to JSON, CSV, and formatted text

## Components

### 1. TimeCollector (`src/libs/performance/time-collector.ts`)

Core utility for collecting and analyzing performance metrics.

**Features:**
- Track multiple concurrent operations
- Calculate statistics (average, min, max)
- Generate comparison reports
- Export to JSON, CSV, and formatted text

**Usage:**
```typescript
import { TimeCollector } from './src/libs/performance';

const collector = new TimeCollector();

// Start tracking
collector.start('test-1', 'clone', {
  vmid: 9000,
  newid: 10000,
  cloneType: 'linked'
});

// ... perform operation ...

// Stop tracking
const metric = collector.stop('test-1');

// Generate report
const report = collector.generateCloneReport();
console.log(collector.exportCloneReportToString());
```

### 2. ClonePerformanceTest (`src/libs/performance/clone-performance-test.ts`)

High-level test orchestrator for running clone performance tests.

**Features:**
- Run multiple linked and full clone tests
- Automatic cleanup of test VMs
- Configurable delays between tests
- Export results to multiple formats

**Usage:**
```typescript
import { ClonePerformanceTest } from './src/libs/performance';

const test = new ClonePerformanceTest();

await test.runTestSuite({
  templateVmid: 9000,
  templateNode: 'pve-node-1',
  targetNode: 'pve-node-1',
  startVmid: 10000,
  linkedCloneCount: 5,
  fullCloneCount: 5,
  cleanupAfterTest: true,
  delayBetweenTests: 2000
});

test.exportToJSON('./report.json');
test.exportToCSV('./report.csv');
```

### 3. CLI Runner (`performance-test.ts`)

Command-line interface for running performance tests.

## Quick Start

### Prerequisites

1. A Proxmox VE template VM (e.g., VMID 9000)
2. Available VM IDs for test VMs (e.g., 10000-10010)
3. Proper PVE credentials configured in `.env`

### Running Tests

#### Check Available Nodes
```bash
# Show all available nodes from database
bun run performance-test.ts --nodes-available
# or
bun run perf:nodes
```

#### View Test Results
```bash
# Display detailed report from JSON file
bun run show-report.ts report-test.json
# or
bun run perf:show report-test.json

# Display as comparison table
bun run show-report.ts report-test.json --table
# or
bun run perf:show report-test.json -t
```

#### Basic Test (Single Target Node)
```bash
bun run performance-test.ts \
  --template-vmid 9000 \
  --template-node pve-node-1 \
  --target-node pve-node-1 \
  --start-vmid 10000 \
  --linked 5 \
  --full 5
```

#### Random Target Nodes from List
```bash
bun run performance-test.ts \
  --template-vmid 9000 \
  --template-node pve-node-1 \
  --target-nodes pve-node-1,pve-node-2,pve-node-3 \
  --start-vmid 10000 \
  --linked 10 \
  --full 10
```

#### Random Target from Database
```bash
bun run performance-test.ts \
  --template-vmid 9000 \
  --template-node pve-node-1 \
  --random-target \
  --start-vmid 10000 \
  --linked 10 \
  --full 10
```

#### With Export
```bash
bun run performance-test.ts \
  --template-vmid 9000 \
  --template-node pve-node-1 \
  --random-target \
  --start-vmid 10000 \
  --linked 10 \
  --full 10 \
  --output-json ./results/report.json \
  --output-csv ./results/report.csv
```

#### Without Cleanup (for debugging)
```bash
bun run performance-test.ts \
  --template-vmid 9000 \
  --template-node pve-node-1 \
  --target-node pve-node-1 \
  --start-vmid 10000 \
  --linked 3 \
  --full 3 \
  --no-cleanup
```

#### With Custom Delay
```bash
bun run performance-test.ts \
  --template-vmid 9000 \
  --template-node pve-node-1 \
  --target-node pve-node-1 \
  --start-vmid 10000 \
  --linked 5 \
  --full 5 \
  --delay 3000
```

## CLI Options

| Option | Description | Required | Default |
|--------|-------------|----------|---------|
| `--template-vmid` | Template VM ID to clone from | Yes | - |
| `--template-node` | Node where template is located | Yes | - |
| `--target-node` | Specific target node for all clones | No* | - |
| `--target-nodes` | Comma-separated list of nodes for random selection | No* | - |
| `--random-target` | Randomly select target from all nodes in database | No* | false |
| `--nodes-available` | Show all available nodes from database and exit | No | false |
| `--start-vmid` | Starting VM ID for test VMs | Yes | - |
| `--linked` | Number of linked clone tests | No | 3 |
| `--full` | Number of full clone tests | No | 3 |
| `--no-cleanup` | Don't cleanup test VMs after completion | No | false |
| `--delay` | Delay between tests in milliseconds | No | 1000 |
| `--output-json` | Output JSON report file path | No | - |
| `--output-csv` | Output CSV report file path | No | - |
| `--help, -h` | Show help message | No | - |

*Note: Must specify one of: `--target-node`, `--target-nodes`, or `--random-target` (not required for `--nodes-available`)

## Report Format

### Console Output
```
════════════════════════════════════════════════════════════════════════════════
  CLONE PERFORMANCE TEST REPORT
════════════════════════════════════════════════════════════════════════════════

Total Tests: 10
  - Linked Clone Tests: 5
  - Full Clone Tests: 5

────────────────────────────────────────────────────────────────────────────────
LINKED CLONE METRICS
────────────────────────────────────────────────────────────────────────────────
  Successful: 5
  Failed: 0
  Average Duration: 12.34s
  Min Duration: 10.12s
  Max Duration: 15.67s

────────────────────────────────────────────────────────────────────────────────
FULL CLONE METRICS
────────────────────────────────────────────────────────────────────────────────
  Successful: 5
  Failed: 0
  Average Duration: 45.78s
  Min Duration: 42.34s
  Max Duration: 50.12s

────────────────────────────────────────────────────────────────────────────────
COMPARISON
────────────────────────────────────────────────────────────────────────────────
  Faster Method: LINKED
  Average Difference: 33.44s
  Percentage Difference: -73.04%
  → Linked clone is 73.04% faster

════════════════════════════════════════════════════════════════════════════════
```

### JSON Output
```json
{
  "timestamp": "2025-10-03T07:05:43.000Z",
  "report": {
    "totalTests": 10,
    "linkedCloneTests": 5,
    "fullCloneTests": 5,
    "linkedCloneMetrics": {
      "average": 12340,
      "min": 10120,
      "max": 15670,
      "total": 5,
      "successful": 5,
      "failed": 0
    },
    "fullCloneMetrics": {
      "average": 45780,
      "min": 42340,
      "max": 50120,
      "total": 5,
      "successful": 5,
      "failed": 0
    },
    "comparison": {
      "averageDifference": 33440,
      "percentageDifference": -73.04,
      "fasterMethod": "linked"
    }
  }
}
```

### CSV Output
```csv
Operation,Clone Type,VMID,New ID,Node,Target,Duration (ms),Duration (s),Status,Error,Timestamp
clone,linked,9000,10000,pve-node-1,pve-node-1,12340.00,12.34,completed,,2025-10-03T07:05:43.000Z
clone,linked,9000,10001,pve-node-1,pve-node-1,11230.00,11.23,completed,,2025-10-03T07:05:55.000Z
...
```

## Performance Metrics

The test collects the following metrics for each clone operation:

- **Operation Type**: clone
- **Clone Type**: linked or full
- **Source VMID**: Template VM ID
- **Target VMID**: New VM ID
- **Node Information**: Source and target nodes
- **Duration**: Time taken in milliseconds and seconds
- **Status**: completed or failed
- **Error**: Error message if failed
- **Timestamp**: When the operation started

## Best Practices

1. **Template Preparation**: Ensure your template VM is properly configured and stopped before testing
2. **VM ID Range**: Use a dedicated range of VM IDs for testing (e.g., 10000-10999)
3. **Multiple Runs**: Run tests multiple times to get consistent results
4. **Network Load**: Consider network load when testing across different nodes
5. **Storage Performance**: Storage backend affects clone performance significantly
6. **Cleanup**: Always cleanup test VMs unless debugging
7. **Random Target Nodes**: Use `--random-target` or `--target-nodes` to test performance across multiple nodes
8. **Cross-Node Testing**: Test both same-node and cross-node cloning for comprehensive results

## Interpreting Results

### Linked Clone
- **Faster**: Creates a copy-on-write clone referencing the template
- **Less Storage**: Only stores differences from template
- **Best For**: Development, testing, temporary instances
- **Limitation**: Dependent on template VM

### Full Clone
- **Slower**: Creates a complete independent copy
- **More Storage**: Full disk copy
- **Best For**: Production, independent instances
- **Advantage**: No dependency on template

### Expected Results
Typically, linked clones are **60-80% faster** than full clones, depending on:
- Template disk size
- Storage backend (local, NFS, Ceph, etc.)
- Network speed (for cross-node clones)
- Node load

## Troubleshooting

### Test Fails to Start
- Verify template VM exists and is accessible
- Check VM ID range is available
- Ensure PVE credentials are correct

### Clone Operations Timeout
- Increase delay between tests
- Check storage performance
- Verify network connectivity

### Cleanup Fails
- Manually delete test VMs using PVE web UI
- Check VM IDs used in the test

## Integration with Existing Code

The performance testing module integrates seamlessly with the existing clone functionality:

```typescript
// In message-handlers.ts
import { globalTimeCollector } from '../libs/performance';

// Start tracking before clone
globalTimeCollector.start(
  `clone-${message.data.vmid}`,
  'clone',
  {
    vmid: template.vm_template_id,
    newid: message.data.vmid,
    cloneType: message.data.full ? 'full' : 'linked'
  }
);

// Existing clone code
const cloneTask = await qemu.clone({
  node: template.vm_template_host,
  vmid: parseInt(template.vm_template_id),
  target: message.data.node,
  newid: message.data.vmid,
  name: message.data.name,
  full: true
});

await task_status(template.vm_template_host, cloneTask.data);

// Stop tracking
globalTimeCollector.stop(`clone-${message.data.vmid}`);
```

## License

This performance testing module is part of the Yuzu VM management system.
