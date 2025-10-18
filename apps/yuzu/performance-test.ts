#!/usr/bin/env bun
/**
 * Clone Performance Test CLI Runner
 * 
 * Default behavior: Runs 3 concurrent linked clones + 3 concurrent full clones
 * 
 * Basic Usage:
 *   bun run performance-test.ts --template-vmid 9000 --template-node pve-node-1 --target-node pve-node-1 --start-vmid 10000
 * 
 * Custom Usage:
 *   bun run performance-test.ts --template-vmid 9000 --template-node pve-node-1 --target-node pve-node-1 --start-vmid 10000 --concurrent-linked 5 --concurrent-full 5
 * 
 * Options:
 *   --template-vmid       Template VM ID to clone from (required)
 *   --template-node       Node where template is located (required)
 *   --target-node         Target node for clones (optional if using random)
 *   --target-nodes        Comma-separated list of target nodes for random selection
 *   --random-target       Randomly select target node from database for each test
 *   --nodes-available     Show available nodes from database and exit
 *   --start-vmid          Starting VM ID for test VMs (required)
 *   --linked              Number of sequential linked clone tests (default: 0)
 *   --full                Number of sequential full clone tests (default: 0)
 *   --concurrent-linked   Number of concurrent linked clone tests (default: 3)
 *   --concurrent-full     Number of concurrent full clone tests (default: 3)
 *   --no-cleanup          Don't cleanup test VMs after completion
 *   --delay               Delay between tests in milliseconds (default: 1000)
 *   --output-json         Output JSON report file path
 *   --output-csv          Output CSV report file path
 */

import { ClonePerformanceTest, CloneTestConfig } from './src/libs/performance';
import { logger } from './src/libs/log';
import { db } from './src/libs/db';

// Parse command line arguments
function parseArgs(): CloneTestConfig & { outputJson?: string; outputCsv?: string; showAvailableNodes?: boolean } {
  const args = process.argv.slice(2);
  const config: any = {
    linkedCloneCount: 0, // Default to 0 for sequential
    fullCloneCount: 0, // Default to 0 for sequential
    concurrentLinkedCount: 3, // Default concurrent linked tests
    concurrentFullCount: 3, // Default concurrent full tests
    cleanupAfterTest: true,
    delayBetweenTests: 1000,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--template-vmid':
        config.templateVmid = parseInt(nextArg);
        i++;
        break;
      case '--template-node':
        config.templateNode = nextArg;
        i++;
        break;
      case '--target-node':
        config.targetNode = nextArg;
        i++;
        break;
      case '--target-nodes':
        config.targetNodes = nextArg.split(',').map(n => n.trim());
        i++;
        break;
      case '--random-target':
        config.randomTargetNode = true;
        break;
      case '--nodes-available':
        config.showAvailableNodes = true;
        break;
      case '--start-vmid':
        config.startVmid = parseInt(nextArg);
        i++;
        break;
      case '--linked':
        config.linkedCloneCount = parseInt(nextArg);
        i++;
        break;
      case '--full':
        config.fullCloneCount = parseInt(nextArg);
        i++;
        break;
      case '--concurrent-linked':
        config.concurrentLinkedCount = parseInt(nextArg);
        i++;
        break;
      case '--concurrent-full':
        config.concurrentFullCount = parseInt(nextArg);
        i++;
        break;
      case '--no-cleanup':
        config.cleanupAfterTest = false;
        break;
      case '--delay':
        config.delayBetweenTests = parseInt(nextArg);
        i++;
        break;
      case '--output-json':
        config.outputJson = nextArg;
        i++;
        break;
      case '--output-csv':
        config.outputCsv = nextArg;
        i++;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  // Skip validation if showing available nodes
  if (config.showAvailableNodes) {
    return config;
  }

  // Validate required arguments
  if (!config.templateVmid || !config.templateNode || !config.startVmid) {
    console.error('Error: Missing required arguments (template-vmid, template-node, start-vmid)');
    printHelp();
    process.exit(1);
  }

  // Validate target node configuration
  if (!config.targetNode && !config.targetNodes && !config.randomTargetNode) {
    console.error('Error: Must specify either --target-node, --target-nodes, or --random-target');
    printHelp();
    process.exit(1);
  }

  return config;
}

function printHelp() {
  console.log(`
Clone Performance Test CLI Runner

Usage:
  bun run performance-test.ts [options]

Required Options:
  --template-vmid <id>      Template VM ID to clone from
  --template-node <node>    Node where template is located
  --start-vmid <id>         Starting VM ID for test VMs

Target Node Options (choose one):
  --target-node <node>      Specific target node for all clones
  --target-nodes <list>     Comma-separated list of nodes for random selection
                            Example: --target-nodes pve-node-1,pve-node-2,pve-node-3
  --random-target           Randomly select from all available nodes in database

Utility Options:
  --nodes-available         Show all available nodes from database and exit

Optional:
  --linked <count>          Number of sequential linked clone tests (default: 0)
  --full <count>            Number of sequential full clone tests (default: 0)
  --concurrent-linked <n>   Number of concurrent linked clone tests (default: 3)
  --concurrent-full <n>     Number of concurrent full clone tests (default: 3)
  --no-cleanup              Don't cleanup test VMs after completion
  --delay <ms>              Delay between tests in milliseconds (default: 1000)
  --output-json <path>      Output JSON report file path
  --output-csv <path>       Output CSV report file path
  --help, -h                Show this help message

Examples:
  # Show available nodes
  bun run performance-test.ts --nodes-available

  # Run basic concurrent tests (default behavior)
  bun run performance-test.ts --template-vmid 9000 --template-node pve-node-1 --target-node pve-node-1 --start-vmid 10000

  # Run with custom concurrent counts
  bun run performance-test.ts --template-vmid 9000 --template-node pve-node-1 --target-node pve-node-1 --start-vmid 10000 --concurrent-linked 5 --concurrent-full 5

  # Run tests with random target nodes from list
  bun run performance-test.ts --template-vmid 9000 --template-node pve-node-1 --target-nodes pve-node-1,pve-node-2,pve-node-3 --start-vmid 10000 --concurrent-linked 10 --concurrent-full 10

  # Run tests with random target from database
  bun run performance-test.ts --template-vmid 9000 --template-node pve-node-1 --random-target --start-vmid 10000 --concurrent-linked 10 --concurrent-full 10

  # Run sequential tests (legacy mode)
  bun run performance-test.ts --template-vmid 9000 --template-node pve-node-1 --target-node pve-node-1 --start-vmid 10000 --linked 5 --full 5 --concurrent-linked 0 --concurrent-full 0

  # Run tests and export results
  bun run performance-test.ts --template-vmid 9000 --template-node pve-node-1 --random-target --start-vmid 10000 --output-json report.json --output-csv report.csv
`);
}

async function showAvailableNodes() {
  try {
    console.log('\n📋 Fetching available nodes from database...\n');

    const nodes = await db.pve_node.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        name: true,
        status: true,
      },
    });

    if (nodes.length === 0) {
      console.log('❌ No available nodes found in database\n');
      process.exit(1);
    }

    console.log(`✅ Found ${nodes.length} available node(s):\n`);
    nodes.forEach((node, index) => {
      console.log(`  ${index + 1}. ${node.name} (${node.status})`);
    });

    console.log('💡 Usage examples:');
    console.log(`\n  # Use specific node:`);
    console.log(`  --target-node ${nodes[0].name}`);

    if (nodes.length > 1) {
      console.log(`\n  # Random from list:`);
      console.log(`  --target-nodes ${nodes.map(n => n.name).join(',')}`);
    }

    console.log(`\n  # Random from database:`);
    console.log(`  --random-target\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fetching nodes:', error);
    process.exit(1);
  }
}

async function main() {
  const config = parseArgs();

  // Handle --nodes-available flag
  if (config.showAvailableNodes) {
    await showAvailableNodes();
    return;
  }

  console.log('\n🚀 Starting Clone Performance Test\n');
  console.log('Configuration:');
  console.log(`  Template VMID: ${config.templateVmid}`);
  console.log(`  Template Node: ${config.templateNode}`);

  if (config.targetNode) {
    console.log(`  Target Node: ${config.targetNode}`);
  } else if (config.targetNodes) {
    console.log(`  Target Nodes (Random): ${config.targetNodes.join(', ')}`);
  } else if (config.randomTargetNode) {
    console.log(`  Target Node: Random from database`);
  }

  console.log(`  Start VMID: ${config.startVmid}`);

  // Display concurrent tests (now default)
  console.log(`  Concurrent Linked Tests: ${config.concurrentLinkedCount || 0}`);
  console.log(`  Concurrent Full Tests: ${config.concurrentFullCount || 0}`);

  // Display sequential tests if specified
  if (config.linkedCloneCount > 0 || config.fullCloneCount > 0) {
    console.log(`  Sequential Linked Tests: ${config.linkedCloneCount}`);
    console.log(`  Sequential Full Tests: ${config.fullCloneCount}`);
  }

  const hasConcurrent = (config.concurrentLinkedCount || 0) > 0 || (config.concurrentFullCount || 0) > 0;
  const hasSequential = config.linkedCloneCount > 0 || config.fullCloneCount > 0;

  let testMode = 'Concurrent (Default)';
  if (hasConcurrent && hasSequential) {
    testMode = 'Mixed (Concurrent + Sequential)';
  } else if (hasSequential && !hasConcurrent) {
    testMode = 'Sequential (Legacy)';
  }

  console.log(`  Test Mode: ${testMode}`);
  console.log(`  Cleanup After Test: ${config.cleanupAfterTest}`);
  console.log(`  Delay Between Tests: ${config.delayBetweenTests}ms\n`); const test = new ClonePerformanceTest();

  try {
    await test.runTestSuite(config);

    // Export results if requested
    if (config.outputJson) {
      test.exportToJSON(config.outputJson);
      console.log(`\n✅ JSON report exported to: ${config.outputJson}`);
    }

    if (config.outputCsv) {
      test.exportToCSV(config.outputCsv);
      console.log(`✅ CSV report exported to: ${config.outputCsv}`);
    }

    console.log('\n✨ Performance test completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Performance test failed:', error);
    logger.error({ error }, 'Performance test failed');
    process.exit(1);
  }
}

// Run the main function
main();
