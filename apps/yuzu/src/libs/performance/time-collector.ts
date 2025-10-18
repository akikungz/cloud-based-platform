/**
 * Performance Time Collector
 * Utility for measuring and collecting performance metrics for VM operations
 */

export interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
  status: 'running' | 'completed' | 'failed';
  error?: string;
}

export interface ClonePerformanceMetric extends PerformanceMetric {
  operation: 'clone';
  metadata: {
    vmid: number;
    newid: number;
    node: string;
    target: string;
    cloneType: 'linked' | 'full';
    templateId: number;
    templateSize?: number;
  };
}

export interface PerformanceReport {
  totalTests: number;
  linkedCloneTests: number;
  fullCloneTests: number;
  linkedCloneMetrics: {
    average: number;
    min: number;
    max: number;
    total: number;
    successful: number;
    failed: number;
  };
  fullCloneMetrics: {
    average: number;
    min: number;
    max: number;
    total: number;
    successful: number;
    failed: number;
  };
  comparison: {
    averageDifference: number;
    percentageDifference: number;
    fasterMethod: 'linked' | 'full' | 'equal';
  };
  metrics: PerformanceMetric[];
}

export class TimeCollector {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private completedMetrics: PerformanceMetric[] = [];

  /**
   * Start tracking a performance metric
   */
  start(id: string, operation: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      operation,
      startTime: performance.now(),
      status: 'running',
      metadata,
    };
    this.metrics.set(id, metric);
  }

  /**
   * Stop tracking a performance metric and mark as completed
   */
  stop(id: string, error?: string): PerformanceMetric | null {
    const metric = this.metrics.get(id);
    if (!metric) {
      console.warn(`No metric found for id: ${id}`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.status = error ? 'failed' : 'completed';
    if (error) {
      metric.error = error;
    }

    this.completedMetrics.push(metric);
    this.metrics.delete(id);

    return metric;
  }

  /**
   * Get concurrent operation statistics
   */
  getConcurrentStats(operation: string): {
    concurrent: number;
    totalRunning: number;
    concurrentOperations: PerformanceMetric[];
  } {
    const concurrentOps = Array.from(this.metrics.values()).filter(
      m => m.operation === operation && m.status === 'running'
    );

    return {
      concurrent: concurrentOps.length,
      totalRunning: this.metrics.size,
      concurrentOperations: concurrentOps,
    };
  }

  /**
   * Get a specific metric by id
   */
  getMetric(id: string): PerformanceMetric | undefined {
    return this.metrics.get(id) || this.completedMetrics.find(m =>
      m.metadata?.id === id
    );
  }

  /**
   * Get all completed metrics
   */
  getCompletedMetrics(): PerformanceMetric[] {
    return [...this.completedMetrics];
  }

  /**
   * Get all running metrics
   */
  getRunningMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.completedMetrics = [];
  }

  /**
   * Generate a performance report for clone operations
   */
  generateCloneReport(): PerformanceReport {
    const cloneMetrics = this.completedMetrics.filter(
      m => m.operation === 'clone'
    ) as ClonePerformanceMetric[];

    const linkedCloneMetrics = cloneMetrics.filter(
      m => m.metadata.cloneType === 'linked' && m.status === 'completed'
    );
    const fullCloneMetrics = cloneMetrics.filter(
      m => m.metadata.cloneType === 'full' && m.status === 'completed'
    );

    const linkedCloneFailed = cloneMetrics.filter(
      m => m.metadata.cloneType === 'linked' && m.status === 'failed'
    );
    const fullCloneFailed = cloneMetrics.filter(
      m => m.metadata.cloneType === 'full' && m.status === 'failed'
    );

    // Calculate linked clone statistics
    const linkedDurations = linkedCloneMetrics.map(m => m.duration!);
    const linkedStats = {
      average: linkedDurations.length > 0
        ? linkedDurations.reduce((a, b) => a + b, 0) / linkedDurations.length
        : 0,
      min: linkedDurations.length > 0 ? Math.min(...linkedDurations) : 0,
      max: linkedDurations.length > 0 ? Math.max(...linkedDurations) : 0,
      total: linkedDurations.length,
      successful: linkedCloneMetrics.length,
      failed: linkedCloneFailed.length,
    };

    // Calculate full clone statistics
    const fullDurations = fullCloneMetrics.map(m => m.duration!);
    const fullStats = {
      average: fullDurations.length > 0
        ? fullDurations.reduce((a, b) => a + b, 0) / fullDurations.length
        : 0,
      min: fullDurations.length > 0 ? Math.min(...fullDurations) : 0,
      max: fullDurations.length > 0 ? Math.max(...fullDurations) : 0,
      total: fullDurations.length,
      successful: fullCloneMetrics.length,
      failed: fullCloneFailed.length,
    };

    // Calculate comparison
    const averageDifference = Math.abs(linkedStats.average - fullStats.average);
    const percentageDifference = fullStats.average > 0
      ? ((linkedStats.average - fullStats.average) / fullStats.average) * 100
      : 0;

    let fasterMethod: 'linked' | 'full' | 'equal' = 'equal';
    if (linkedStats.average < fullStats.average && linkedStats.average > 0) {
      fasterMethod = 'linked';
    } else if (fullStats.average < linkedStats.average && fullStats.average > 0) {
      fasterMethod = 'full';
    }

    return {
      totalTests: cloneMetrics.length,
      linkedCloneTests: linkedCloneMetrics.length + linkedCloneFailed.length,
      fullCloneTests: fullCloneMetrics.length + fullCloneFailed.length,
      linkedCloneMetrics: linkedStats,
      fullCloneMetrics: fullStats,
      comparison: {
        averageDifference,
        percentageDifference,
        fasterMethod,
      },
      metrics: cloneMetrics,
    };
  }

  /**
   * Export metrics to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      running: Array.from(this.metrics.values()),
      completed: this.completedMetrics,
      timestamp: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Export clone report to formatted string
   */
  exportCloneReportToString(): string {
    const report = this.generateCloneReport();

    let output = '\n';
    output += '═'.repeat(80) + '\n';
    output += '  CLONE PERFORMANCE TEST REPORT\n';
    output += '═'.repeat(80) + '\n\n';

    output += `Total Tests: ${report.totalTests}\n`;
    output += `  - Linked Clone Tests: ${report.linkedCloneTests}\n`;
    output += `  - Full Clone Tests: ${report.fullCloneTests}\n\n`;

    output += '─'.repeat(80) + '\n';
    output += 'LINKED CLONE METRICS\n';
    output += '─'.repeat(80) + '\n';
    output += `  Successful: ${report.linkedCloneMetrics.successful}\n`;
    output += `  Failed: ${report.linkedCloneMetrics.failed}\n`;
    output += `  Average Duration: ${(report.linkedCloneMetrics.average / 1000).toFixed(2)}s\n`;
    output += `  Min Duration: ${(report.linkedCloneMetrics.min / 1000).toFixed(2)}s\n`;
    output += `  Max Duration: ${(report.linkedCloneMetrics.max / 1000).toFixed(2)}s\n\n`;

    output += '─'.repeat(80) + '\n';
    output += 'FULL CLONE METRICS\n';
    output += '─'.repeat(80) + '\n';
    output += `  Successful: ${report.fullCloneMetrics.successful}\n`;
    output += `  Failed: ${report.fullCloneMetrics.failed}\n`;
    output += `  Average Duration: ${(report.fullCloneMetrics.average / 1000).toFixed(2)}s\n`;
    output += `  Min Duration: ${(report.fullCloneMetrics.min / 1000).toFixed(2)}s\n`;
    output += `  Max Duration: ${(report.fullCloneMetrics.max / 1000).toFixed(2)}s\n\n`;

    output += '─'.repeat(80) + '\n';
    output += 'COMPARISON\n';
    output += '─'.repeat(80) + '\n';
    output += `  Faster Method: ${report.comparison.fasterMethod.toUpperCase()}\n`;
    output += `  Average Difference: ${(report.comparison.averageDifference / 1000).toFixed(2)}s\n`;
    output += `  Percentage Difference: ${report.comparison.percentageDifference.toFixed(2)}%\n`;

    if (report.comparison.fasterMethod === 'linked') {
      output += `  → Linked clone is ${Math.abs(report.comparison.percentageDifference).toFixed(2)}% faster\n`;
    } else if (report.comparison.fasterMethod === 'full') {
      output += `  → Full clone is ${Math.abs(report.comparison.percentageDifference).toFixed(2)}% faster\n`;
    }

    output += '\n' + '═'.repeat(80) + '\n';

    return output;
  }

  /**
   * Export detailed metrics to CSV format
   */
  exportToCSV(): string {
    const headers = [
      'Operation',
      'Clone Type',
      'VMID',
      'New ID',
      'Node',
      'Target',
      'Duration (ms)',
      'Duration (s)',
      'Status',
      'Error',
      'Timestamp'
    ];

    const rows = this.completedMetrics
      .filter(m => m.operation === 'clone')
      .map(m => {
        const metric = m as ClonePerformanceMetric;
        return [
          metric.operation,
          metric.metadata.cloneType,
          metric.metadata.vmid,
          metric.metadata.newid,
          metric.metadata.node,
          metric.metadata.target,
          metric.duration?.toFixed(2) || 'N/A',
          metric.duration ? (metric.duration / 1000).toFixed(2) : 'N/A',
          metric.status,
          metric.error || '',
          new Date(metric.startTime).toISOString()
        ];
      });

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }
}

// Singleton instance for global use
export const globalTimeCollector = new TimeCollector();
