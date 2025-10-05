/**
 * Performance Test Example
 * 
 * This example demonstrates how to use the performance testing utilities
 * to compare linked-clone vs full clone operations.
 */

import { ClonePerformanceTest, TimeCollector } from '../src/libs/performance';
import { logger } from '../src/libs/log';

/**
 * Example 1: Basic Performance Test
 */
async function basicPerformanceTest() {
  console.log('\n=== Example 1: Basic Performance Test ===\n');

  const test = new ClonePerformanceTest();

  await test.runTestSuite({
    templateVmid: 9000,
    templateNode: 'pve-node-1',
    targetNode: 'pve-node-1',
    startVmid: 10000,
    linkedCloneCount: 3,
    fullCloneCount: 3,
    cleanupAfterTest: true,
    delayBetweenTests: 1000,
  });

  // Print report to console
  test.printReport();
}

/**
 * Example 2: Advanced Test with Export
 */
async function advancedPerformanceTest() {
  console.log('\n=== Example 2: Advanced Test with Export ===\n');

  const test = new ClonePerformanceTest();

  await test.runTestSuite({
    templateVmid: 9000,
    templateNode: 'pve-node-1',
    targetNode: 'pve-node-1',
    startVmid: 11000,
    linkedCloneCount: 10,
    fullCloneCount: 10,
    cleanupAfterTest: true,
    delayBetweenTests: 2000,
  });

  // Export results
  test.exportToJSON('./performance-results.json');
  test.exportToCSV('./performance-results.csv');

  console.log('\n✅ Results exported to:');
  console.log('  - performance-results.json');
  console.log('  - performance-results.csv');
}

/**
 * Example 3: Using TimeCollector Directly
 */
async function directTimeCollectorExample() {
  console.log('\n=== Example 3: Direct TimeCollector Usage ===\n');

  const collector = new TimeCollector();

  // Simulate some operations
  for (let i = 0; i < 5; i++) {
    const id = `test-${i}`;
    
    collector.start(id, 'clone', {
      vmid: 9000,
      newid: 12000 + i,
      cloneType: i % 2 === 0 ? 'linked' : 'full',
    });

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000));

    collector.stop(id);
  }

  // Generate and print report
  const report = collector.generateCloneReport();
  console.log(collector.exportCloneReportToString());

  // Export to JSON
  console.log('\nJSON Export:');
  console.log(collector.exportToJSON());
}

/**
 * Example 4: Cross-Node Performance Test
 */
async function crossNodePerformanceTest() {
  console.log('\n=== Example 4: Cross-Node Performance Test ===\n');

  const test = new ClonePerformanceTest();

  // Test cloning from one node to another
  await test.runTestSuite({
    templateVmid: 9000,
    templateNode: 'pve-node-1',
    targetNode: 'pve-node-2', // Different node
    startVmid: 13000,
    linkedCloneCount: 5,
    fullCloneCount: 5,
    cleanupAfterTest: true,
    delayBetweenTests: 3000, // Longer delay for cross-node operations
  });

  test.printReport();
}

/**
 * Example 5: Stress Test (Many Clones)
 */
async function stressTest() {
  console.log('\n=== Example 5: Stress Test ===\n');

  const test = new ClonePerformanceTest();

  await test.runTestSuite({
    templateVmid: 9000,
    templateNode: 'pve-node-1',
    targetNode: 'pve-node-1',
    startVmid: 14000,
    linkedCloneCount: 20,
    fullCloneCount: 20,
    cleanupAfterTest: true,
    delayBetweenTests: 500, // Shorter delay for stress testing
  });

  // Get detailed results
  const results = test.getResults();
  const successRate = (results.filter(r => r.success).length / results.length) * 100;

  console.log(`\n📊 Stress Test Results:`);
  console.log(`  Total Tests: ${results.length}`);
  console.log(`  Success Rate: ${successRate.toFixed(2)}%`);
  console.log(`  Failed Tests: ${results.filter(r => !r.success).length}`);

  test.printReport();
}

/**
 * Example 6: Custom Analysis
 */
async function customAnalysis() {
  console.log('\n=== Example 6: Custom Analysis ===\n');

  const test = new ClonePerformanceTest();

  await test.runTestSuite({
    templateVmid: 9000,
    templateNode: 'pve-node-1',
    targetNode: 'pve-node-1',
    startVmid: 15000,
    linkedCloneCount: 10,
    fullCloneCount: 10,
    cleanupAfterTest: true,
    delayBetweenTests: 1500,
  });

  // Get collector for custom analysis
  const collector = test.getCollector();
  const metrics = collector.getCompletedMetrics();

  // Custom analysis: Find outliers
  const linkedMetrics = metrics.filter(m => 
    m.metadata?.cloneType === 'linked' && m.duration
  );
  const fullMetrics = metrics.filter(m => 
    m.metadata?.cloneType === 'full' && m.duration
  );

  if (linkedMetrics.length > 0) {
    const linkedAvg = linkedMetrics.reduce((sum, m) => sum + m.duration!, 0) / linkedMetrics.length;
    const linkedOutliers = linkedMetrics.filter(m => 
      Math.abs(m.duration! - linkedAvg) > linkedAvg * 0.5
    );

    console.log(`\n🔍 Linked Clone Outliers (>50% deviation):`);
    linkedOutliers.forEach(m => {
      console.log(`  - VM ${m.metadata?.newid}: ${(m.duration! / 1000).toFixed(2)}s`);
    });
  }

  if (fullMetrics.length > 0) {
    const fullAvg = fullMetrics.reduce((sum, m) => sum + m.duration!, 0) / fullMetrics.length;
    const fullOutliers = fullMetrics.filter(m => 
      Math.abs(m.duration! - fullAvg) > fullAvg * 0.5
    );

    console.log(`\n🔍 Full Clone Outliers (>50% deviation):`);
    fullOutliers.forEach(m => {
      console.log(`  - VM ${m.metadata?.newid}: ${(m.duration! / 1000).toFixed(2)}s`);
    });
  }

  test.printReport();
}

/**
 * Main function to run examples
 */
async function main() {
  const exampleNumber = process.argv[2] || '1';

  try {
    switch (exampleNumber) {
      case '1':
        await basicPerformanceTest();
        break;
      case '2':
        await advancedPerformanceTest();
        break;
      case '3':
        await directTimeCollectorExample();
        break;
      case '4':
        await crossNodePerformanceTest();
        break;
      case '5':
        await stressTest();
        break;
      case '6':
        await customAnalysis();
        break;
      case 'all':
        await basicPerformanceTest();
        await advancedPerformanceTest();
        await directTimeCollectorExample();
        break;
      default:
        console.log('Available examples:');
        console.log('  1 - Basic Performance Test');
        console.log('  2 - Advanced Test with Export');
        console.log('  3 - Direct TimeCollector Usage');
        console.log('  4 - Cross-Node Performance Test');
        console.log('  5 - Stress Test');
        console.log('  6 - Custom Analysis');
        console.log('  all - Run examples 1-3');
        console.log('\nUsage: bun examples/performance-test-example.ts [1-6|all]');
    }
  } catch (error) {
    console.error('❌ Example failed:', error);
    logger.error({ error }, 'Example failed');
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.main) {
  main();
}
