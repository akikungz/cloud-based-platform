/**
 * Clone Performance Test
 * Script to test and compare performance between linked-clone and full clone operations
 */

import { TimeCollector, ClonePerformanceMetric } from './time-collector';
import { clone } from '../pve/qemu';
import { task_status } from '../pve';
import { logger } from '../log';
import { db } from '../db';

export interface CloneTestConfig {
  templateVmid: number;
  templateNode: string;
  targetNode?: string; // Optional: if not provided, will use random from targetNodes
  targetNodes?: string[]; // Optional: array of nodes to randomly select from
  startVmid: number;
  linkedCloneCount: number;
  fullCloneCount: number;
  cleanupAfterTest?: boolean;
  delayBetweenTests?: number; // milliseconds
  randomTargetNode?: boolean; // If true, randomly select target node for each test
}

export interface CloneTestResult {
  testId: string;
  vmid: number;
  newid: number;
  cloneType: 'linked' | 'full';
  targetNode: string;
  duration: number;
  success: boolean;
  error?: string;
}

export class ClonePerformanceTest {
  private collector: TimeCollector;
  private results: CloneTestResult[] = [];
  private availableNodes: string[] = [];

  constructor() {
    this.collector = new TimeCollector();
  }

  /**
   * Get random target node from available nodes
   */
  private getRandomTargetNode(): string {
    if (this.availableNodes.length === 0) {
      throw new Error('No available target nodes');
    }
    const randomIndex = Math.floor(Math.random() * this.availableNodes.length);
    return this.availableNodes[randomIndex];
  }

  /**
   * Fetch available nodes from database
   */
  private async fetchAvailableNodes(): Promise<string[]> {
    try {
      const nodes = await db.pve_node.findMany({
        where: {
          deleted_at: null,
        },
        select: {
          name: true,
        },
      });
      return nodes.map(n => n.name);
    } catch (error) {
      logger.error({ error }, 'Failed to fetch available nodes from database');
      return [];
    }
  }

  /**
   * Run a single clone test
   */
  private async runCloneTest(
    templateVmid: number,
    templateNode: string,
    targetNode: string,
    newVmid: number,
    cloneType: 'linked' | 'full'
  ): Promise<CloneTestResult> {
    const testId = `clone-${cloneType}-${newVmid}`;
    const vmName = `perf-test-${cloneType}-${newVmid}`;

    logger.info({
      testId,
      cloneType,
      templateVmid,
      newVmid,
    }, `Starting ${cloneType} clone test`);

    // Start performance tracking
    this.collector.start(testId, 'clone', {
      vmid: templateVmid,
      newid: newVmid,
      node: templateNode,
      target: targetNode,
      cloneType,
      templateId: templateVmid,
    });

    try {
      // Execute clone operation
      const cloneTask = await clone({
        node: templateNode,
        vmid: templateVmid,
        target: targetNode,
        newid: newVmid,
        name: vmName,
        full: cloneType === 'full', // true for full clone, false/undefined for linked clone
      });

      logger.info({ testId, taskId: cloneTask.data }, 'Clone task started');

      // Wait for clone to complete
      await task_status(templateNode, cloneTask.data);

      // Stop tracking and mark as success
      const metric = this.collector.stop(testId);

      logger.info({
        testId,
        duration: metric?.duration,
        cloneType,
      }, 'Clone test completed successfully');

      return {
        testId,
        vmid: templateVmid,
        newid: newVmid,
        cloneType,
        targetNode,
        duration: metric?.duration || 0,
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Stop tracking and mark as failed
      this.collector.stop(testId, errorMessage);

      logger.error({
        testId,
        error: errorMessage,
        cloneType,
      }, 'Clone test failed');

      return {
        testId,
        vmid: templateVmid,
        newid: newVmid,
        cloneType,
        targetNode,
        duration: 0,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Cleanup test VMs
   */
  private async cleanupTestVM(node: string, vmid: number): Promise<void> {
    try {
      const { qemu } = await import('../pve');
      
      logger.info({ vmid, node }, 'Cleaning up test VM');

      // Try to stop VM first
      try {
        const stopTask = await qemu.setStatusQEMU({
          node,
          vmid,
          state: 'stop',
        });
        await task_status(node, stopTask.data);
      } catch (error) {
        // VM might already be stopped
        logger.debug({ vmid, error }, 'VM stop failed or already stopped');
      }

      // Delete VM
      const deleteTask = await qemu.deleteQEMU({
        node,
        vmid,
      });
      await task_status(node, deleteTask.data);

      logger.info({ vmid, node }, 'Test VM cleaned up successfully');
    } catch (error) {
      logger.error({
        vmid,
        node,
        error: error instanceof Error ? error.message : String(error),
      }, 'Failed to cleanup test VM');
    }
  }

  /**
   * Run performance test suite
   */
  async runTestSuite(config: CloneTestConfig): Promise<void> {
    logger.info(config, 'Starting clone performance test suite');

    const {
      templateVmid,
      templateNode,
      targetNode,
      targetNodes,
      startVmid,
      linkedCloneCount,
      fullCloneCount,
      cleanupAfterTest = true,
      delayBetweenTests = 1000,
      randomTargetNode = false,
    } = config;

    // Setup available nodes for random selection
    if (randomTargetNode || targetNodes) {
      if (targetNodes && targetNodes.length > 0) {
        this.availableNodes = targetNodes;
        logger.info({ nodes: this.availableNodes }, 'Using provided target nodes for random selection');
      } else {
        this.availableNodes = await this.fetchAvailableNodes();
        logger.info({ nodes: this.availableNodes }, 'Fetched available nodes from database');
      }

      if (this.availableNodes.length === 0) {
        throw new Error('No available nodes found for random selection');
      }
    } else if (!targetNode) {
      throw new Error('Either targetNode or randomTargetNode/targetNodes must be provided');
    }

    let currentVmid = startVmid;
    const createdVmids: { vmid: number; node: string }[] = [];

    try {
      // Run linked clone tests
      logger.info({ count: linkedCloneCount }, 'Running linked clone tests');
      for (let i = 0; i < linkedCloneCount; i++) {
        const selectedTargetNode = randomTargetNode || targetNodes 
          ? this.getRandomTargetNode() 
          : targetNode!;
        
        logger.info({ targetNode: selectedTargetNode }, `Test ${i + 1}: Selected target node`);
        
        const result = await this.runCloneTest(
          templateVmid,
          templateNode,
          selectedTargetNode,
          currentVmid,
          'linked'
        );
        this.results.push(result);
        if (result.success) {
          createdVmids.push({ vmid: currentVmid, node: selectedTargetNode });
        }
        currentVmid++;

        // Delay between tests
        if (i < linkedCloneCount - 1 && delayBetweenTests > 0) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenTests));
        }
      }

      // Run full clone tests
      logger.info({ count: fullCloneCount }, 'Running full clone tests');
      for (let i = 0; i < fullCloneCount; i++) {
        const selectedTargetNode = randomTargetNode || targetNodes 
          ? this.getRandomTargetNode() 
          : targetNode!;
        
        logger.info({ targetNode: selectedTargetNode }, `Test ${i + 1}: Selected target node`);
        
        const result = await this.runCloneTest(
          templateVmid,
          templateNode,
          selectedTargetNode,
          currentVmid,
          'full'
        );
        this.results.push(result);
        if (result.success) {
          createdVmids.push({ vmid: currentVmid, node: selectedTargetNode });
        }
        currentVmid++;

        // Delay between tests
        if (i < fullCloneCount - 1 && delayBetweenTests > 0) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenTests));
        }
      }

      logger.info('All clone tests completed');

      // Generate and log report
      this.printReport();

    } finally {
      // Cleanup if requested
      if (cleanupAfterTest && createdVmids.length > 0) {
        logger.info({ count: createdVmids.length }, 'Cleaning up test VMs');
        for (const vm of createdVmids) {
          await this.cleanupTestVM(vm.node, vm.vmid);
          
          // Small delay between cleanups
          if (delayBetweenTests > 0) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenTests / 2));
          }
        }
      }
    }
  }

  /**
   * Print performance report
   */
  printReport(): void {
    const report = this.collector.generateCloneReport();
    const reportString = this.collector.exportCloneReportToString();

    console.log(reportString);

    // Also log to logger
    logger.info({
      report: {
        totalTests: report.totalTests,
        linkedClone: {
          tests: report.linkedCloneTests,
          avgDuration: `${(report.linkedCloneMetrics.average / 1000).toFixed(2)}s`,
          successful: report.linkedCloneMetrics.successful,
          failed: report.linkedCloneMetrics.failed,
        },
        fullClone: {
          tests: report.fullCloneTests,
          avgDuration: `${(report.fullCloneMetrics.average / 1000).toFixed(2)}s`,
          successful: report.fullCloneMetrics.successful,
          failed: report.fullCloneMetrics.failed,
        },
        comparison: {
          fasterMethod: report.comparison.fasterMethod,
          percentageDifference: `${report.comparison.percentageDifference.toFixed(2)}%`,
        },
      },
    }, 'Clone performance test report');
  }

  /**
   * Export results to JSON file
   */
  exportToJSON(filepath: string): void {
    const fs = require('fs');
    const report = this.collector.generateCloneReport();
    
    fs.writeFileSync(filepath, JSON.stringify({
      timestamp: new Date().toISOString(),
      report,
      rawMetrics: this.collector.getCompletedMetrics(),
      results: this.results,
    }, null, 2));

    logger.info({ filepath }, 'Performance report exported to JSON');
  }

  /**
   * Export results to CSV file
   */
  exportToCSV(filepath: string): void {
    const fs = require('fs');
    const csv = this.collector.exportToCSV();
    
    fs.writeFileSync(filepath, csv);

    logger.info({ filepath }, 'Performance report exported to CSV');
  }

  /**
   * Get test results
   */
  getResults(): CloneTestResult[] {
    return this.results;
  }

  /**
   * Get performance collector
   */
  getCollector(): TimeCollector {
    return this.collector;
  }
}

/**
 * Example usage function
 */
export async function runExamplePerformanceTest() {
  const test = new ClonePerformanceTest();

  // Example configuration
  const config: CloneTestConfig = {
    templateVmid: 9000, // Your template VM ID
    templateNode: 'pve-node-1', // Node where template is located
    targetNode: 'pve-node-1', // Target node for clones
    startVmid: 10000, // Starting VM ID for test VMs
    linkedCloneCount: 5, // Number of linked clone tests
    fullCloneCount: 5, // Number of full clone tests
    cleanupAfterTest: true, // Clean up test VMs after completion
    delayBetweenTests: 2000, // 2 second delay between tests
  };

  try {
    await test.runTestSuite(config);

    // Export results
    test.exportToJSON('./performance-report.json');
    test.exportToCSV('./performance-report.csv');

    return test.getCollector().generateCloneReport();
  } catch (error) {
    logger.error({ error }, 'Performance test failed');
    throw error;
  }
}
