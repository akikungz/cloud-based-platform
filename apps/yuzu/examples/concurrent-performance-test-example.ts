/**
 * Concurrent Performance Test Example
 * 
 * This example demonstrates how to use the concurrent testing features
 * to compare performance under concurrent load.
 */

import { ClonePerformanceTest } from '../src/libs/performance';
import { logger } from '../src/libs/log';

/**
 * Example 1: Basic Concurrent vs Sequential Comparison
 */
async function concurrentVsSequentialTest() {
  console.log('\n=== Example 1: Concurrent vs Sequential Comparison ===\n');

  const baseConfig = {
    templateVmid: 9000,
    templateNode: 'pve-node-1',
    targetNode: 'pve-node-1',
    startVmid: 12000,
    cleanupAfterTest: true,
    delayBetweenTests: 1000,
  };

  // Sequential test
  console.log('Running sequential tests...');
  const sequentialTest = new ClonePerformanceTest();
  await sequentialTest.runTestSuite({
    ...baseConfig,
    linkedCloneCount: 5,
    fullCloneCount: 5,
  });

  // Concurrent test
  console.log('\nRunning concurrent tests...');
  const concurrentTest = new ClonePerformanceTest();
  await concurrentTest.runTestSuite({
    ...baseConfig,
    startVmid: 13000,
    linkedCloneCount: 0, // Use concurrent settings instead
    fullCloneCount: 0,
    concurrentLinkedCount: 5,
    concurrentFullCount: 5,
  });

  console.log('\n--- Sequential Test Results ---');
  sequentialTest.printReport();

  console.log('\n--- Concurrent Test Results ---');
  concurrentTest.printReport();
}

/**
 * Example 2: Heavy Concurrent Load Testing
 */
async function heavyConcurrentLoadTest() {
  console.log('\n=== Example 2: Heavy Concurrent Load Testing ===\n');

  const test = new ClonePerformanceTest();

  await test.runTestSuite({
    templateVmid: 9000,
    templateNode: 'pve-node-1',
    targetNodes: ['pve-node-1', 'pve-node-2', 'pve-node-3'], // Distribute load across nodes
    startVmid: 14000,
    linkedCloneCount: 0,
    fullCloneCount: 0,
    concurrentLinkedCount: 20, // Heavy concurrent load
    concurrentFullCount: 10,
    cleanupAfterTest: true,
    delayBetweenTests: 2000, // Longer delay between batches
  });

  // Export detailed results
  test.exportToJSON('./concurrent-load-test-results.json');
  test.exportToCSV('./concurrent-load-test-results.csv');
  test.printReport();

  console.log('\n✅ Results exported to concurrent-load-test-results.json and .csv');
}

/**
 * Example 3: Stress Test with Random Nodes
 */
async function stressTestWithRandomNodes() {
  console.log('\n=== Example 3: Stress Test with Random Node Selection ===\n');

  const test = new ClonePerformanceTest();

  await test.runTestSuite({
    templateVmid: 9000,
    templateNode: 'pve-node-1',
    randomTargetNode: true, // Random node selection from database
    startVmid: 15000,
    linkedCloneCount: 0,
    fullCloneCount: 0,
    concurrentLinkedCount: 15,
    concurrentFullCount: 5,
    cleanupAfterTest: true,
    delayBetweenTests: 3000,
  });

  test.printReport();
}

/**
 * Example 4: Performance Comparison with Different Concurrent Levels
 */
async function performanceComparisonTest() {
  console.log('\n=== Example 4: Performance Comparison - Different Concurrent Levels ===\n');

  const baseConfig = {
    templateVmid: 9000,
    templateNode: 'pve-node-1',
    targetNode: 'pve-node-1',
    cleanupAfterTest: true,
    delayBetweenTests: 2000,
    linkedCloneCount: 0,
    fullCloneCount: 0,
  };

  const concurrencyLevels = [1, 3, 5, 10];
  const results: { level: number; test: ClonePerformanceTest }[] = [];

  for (const level of concurrencyLevels) {
    console.log(`\n--- Testing with ${level} concurrent operations ---`);

    const test = new ClonePerformanceTest();
    await test.runTestSuite({
      ...baseConfig,
      startVmid: 16000 + (level * 100), // Spread VM IDs
      concurrentLinkedCount: level,
    });

    results.push({ level, test });
  }

  // Compare results
  console.log('\n=== Performance Comparison Summary ===');
  results.forEach(({ level, test }) => {
    const report = test.getReport();
    console.log(`\nConcurrency Level: ${level}`);
    console.log(`  Average Duration: ${report.linkedCloneMetrics.average.toFixed(2)}ms`);
    console.log(`  Min Duration: ${report.linkedCloneMetrics.min.toFixed(2)}ms`);
    console.log(`  Max Duration: ${report.linkedCloneMetrics.max.toFixed(2)}ms`);
    console.log(`  Success Rate: ${((report.linkedCloneMetrics.successful / report.linkedCloneMetrics.total) * 100).toFixed(1)}%`);
  });
}

// Main execution
async function main() {
  try {
    await concurrentVsSequentialTest();

    console.log('\n' + '='.repeat(80));

    await heavyConcurrentLoadTest();

    console.log('\n' + '='.repeat(80));

    await stressTestWithRandomNodes();

    console.log('\n' + '='.repeat(80));

    await performanceComparisonTest();

    console.log('\n✨ All concurrent performance tests completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Concurrent performance tests failed:', error);
    logger.error({ error }, 'Concurrent performance tests failed');
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}

export {
  concurrentVsSequentialTest,
  heavyConcurrentLoadTest,
  stressTestWithRandomNodes,
  performanceComparisonTest,
};