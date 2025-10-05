#!/usr/bin/env bun
/**
 * Show Performance Test Report
 * 
 * Display formatted performance test results from JSON report file
 * 
 * Usage:
 *   bun show-report.ts <report-file.json>
 *   bun show-report.ts report-test.json
 *   bun show-report.ts report-test.json --table
 */

import { readFileSync } from 'fs';

interface PerformanceReport {
  timestamp: string;
  report: {
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
    metrics: any[];
  };
  rawMetrics?: any[];
  results?: any[];
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatPercentage(value: number): string {
  return `${Math.abs(value).toFixed(2)}%`;
}

function displayTableComparison(reportPath: string) {
  try {
    const fileContent = readFileSync(reportPath, 'utf-8');
    const data: PerformanceReport = JSON.parse(fileContent);
    const { report } = data;

    console.log('\n' + '═'.repeat(80));
    console.log('  CLONE PERFORMANCE COMPARISON TABLE');
    console.log('═'.repeat(80) + '\n');

    const timestamp = new Date(data.timestamp);
    console.log(`📅 Test Date: ${timestamp.toLocaleString()}`);
    console.log(`📁 Report File: ${reportPath}\n`);

    // Main Comparison Table using console.table
    console.log('📊 PERFORMANCE METRICS\n');
    const metricsTable = {
      'Total Tests': {
        'Linked Clone': report.linkedCloneTests,
        'Full Clone': report.fullCloneTests
      },
      '✅ Successful': {
        'Linked Clone': report.linkedCloneMetrics.successful,
        'Full Clone': report.fullCloneMetrics.successful
      },
      '❌ Failed': {
        'Linked Clone': report.linkedCloneMetrics.failed,
        'Full Clone': report.fullCloneMetrics.failed
      },
      '📊 Average Duration': {
        'Linked Clone': formatDuration(report.linkedCloneMetrics.average),
        'Full Clone': formatDuration(report.fullCloneMetrics.average)
      },
      '⚡ Min Duration': {
        'Linked Clone': formatDuration(report.linkedCloneMetrics.min),
        'Full Clone': formatDuration(report.fullCloneMetrics.min)
      },
      '🐌 Max Duration': {
        'Linked Clone': formatDuration(report.linkedCloneMetrics.max),
        'Full Clone': formatDuration(report.fullCloneMetrics.max)
      }
    };
    console.table(metricsTable);

    // Winner Summary
    const winner = report.comparison.fasterMethod.toUpperCase();
    const diff = formatDuration(report.comparison.averageDifference);
    const percent = formatPercentage(report.comparison.percentageDifference);
    const speedup = report.comparison.fasterMethod === 'linked' 
      ? (report.fullCloneMetrics.average / report.linkedCloneMetrics.average).toFixed(2)
      : (report.linkedCloneMetrics.average / report.fullCloneMetrics.average).toFixed(2);

    console.log('\n🏆 COMPARISON SUMMARY\n');
    const comparisonTable = {
      'Faster Method': winner,
      'Time Difference': diff,
      'Percentage Faster': `${percent}`,
      'Speedup': `${speedup}x`
    };
    console.table(comparisonTable);

    // Per-Node Table (if available)
    if (data.results && data.results.length > 0) {
      const byNode: Record<string, any> = {};
      data.results.forEach(result => {
        if (!byNode[result.targetNode]) {
          byNode[result.targetNode] = {
            'Total Tests': 0,
            'Successful': 0,
            'Failed': 0,
            'Total Duration': 0,
            'Success Count': 0
          };
        }
        byNode[result.targetNode]['Total Tests']++;
        if (result.success) {
          byNode[result.targetNode]['Successful']++;
          byNode[result.targetNode]['Total Duration'] += result.duration;
          byNode[result.targetNode]['Success Count']++;
        } else {
          byNode[result.targetNode]['Failed']++;
        }
      });

      // Calculate averages and format
      const nodeTable: Record<string, any> = {};
      Object.entries(byNode).forEach(([node, stats]: [string, any]) => {
        nodeTable[node] = {
          'Total Tests': stats['Total Tests'],
          'Successful': stats['Successful'],
          'Failed': stats['Failed'],
          'Avg Duration': stats['Success Count'] > 0 
            ? formatDuration(stats['Total Duration'] / stats['Success Count'])
            : 'N/A'
        };
      });

      console.log('\n📍 PER-NODE ANALYSIS\n');
      console.table(nodeTable);
    }

    // Individual Test Results Table
    if (data.results && data.results.length > 0) {
      const testResultsTable = data.results.map((test, idx) => ({
        '#': idx + 1,
        'Clone Type': test.cloneType,
        'VM ID': test.newid,
        'Target Node': test.targetNode,
        'Status': test.success ? '✅ Pass' : '❌ Fail',
        'Duration': test.success ? formatDuration(test.duration) : 'N/A'
      }));

      console.log('\n📋 TEST RESULTS\n');
      console.table(testResultsTable);
    }

    console.log('═'.repeat(80) + '\n');

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        console.error(`\n❌ Error: Report file not found: ${reportPath}\n`);
      } else if (error.message.includes('JSON')) {
        console.error(`\n❌ Error: Invalid JSON format in file: ${reportPath}\n`);
      } else {
        console.error(`\n❌ Error: ${error.message}\n`);
      }
    } else {
      console.error(`\n❌ Unknown error occurred\n`);
    }
    process.exit(1);
  }
}

function displayReport(reportPath: string) {
  try {
    // Read and parse JSON file
    const fileContent = readFileSync(reportPath, 'utf-8');
    const data: PerformanceReport = JSON.parse(fileContent);

    const { report } = data;

    console.log('\n' + '═'.repeat(80));
    console.log('  CLONE PERFORMANCE TEST REPORT');
    console.log('═'.repeat(80) + '\n');

    // Timestamp
    const timestamp = new Date(data.timestamp);
    console.log(`📅 Test Date: ${timestamp.toLocaleString()}`);
    console.log(`📁 Report File: ${reportPath}\n`);

    // Summary
    console.log('─'.repeat(80));
    console.log('SUMMARY');
    console.log('─'.repeat(80));
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`  • Linked Clone Tests: ${report.linkedCloneTests}`);
    console.log(`  • Full Clone Tests: ${report.fullCloneTests}\n`);

    // Linked Clone Metrics
    console.log('─'.repeat(80));
    console.log('LINKED CLONE METRICS');
    console.log('─'.repeat(80));
    console.log(`✅ Successful: ${report.linkedCloneMetrics.successful}`);
    console.log(`❌ Failed: ${report.linkedCloneMetrics.failed}`);
    console.log(`📊 Average Duration: ${formatDuration(report.linkedCloneMetrics.average)}`);
    console.log(`⚡ Min Duration: ${formatDuration(report.linkedCloneMetrics.min)}`);
    console.log(`🐌 Max Duration: ${formatDuration(report.linkedCloneMetrics.max)}\n`);

    // Full Clone Metrics
    console.log('─'.repeat(80));
    console.log('FULL CLONE METRICS');
    console.log('─'.repeat(80));
    console.log(`✅ Successful: ${report.fullCloneMetrics.successful}`);
    console.log(`❌ Failed: ${report.fullCloneMetrics.failed}`);
    console.log(`📊 Average Duration: ${formatDuration(report.fullCloneMetrics.average)}`);
    console.log(`⚡ Min Duration: ${formatDuration(report.fullCloneMetrics.min)}`);
    console.log(`🐌 Max Duration: ${formatDuration(report.fullCloneMetrics.max)}\n`);

    // Comparison
    console.log('─'.repeat(80));
    console.log('COMPARISON');
    console.log('─'.repeat(80));
    console.log(`🏆 Faster Method: ${report.comparison.fasterMethod.toUpperCase()}`);
    console.log(`⏱️  Average Difference: ${formatDuration(report.comparison.averageDifference)}`);
    console.log(`📈 Percentage Difference: ${formatPercentage(report.comparison.percentageDifference)}`);
    
    if (report.comparison.fasterMethod === 'linked') {
      const speedup = (report.fullCloneMetrics.average / report.linkedCloneMetrics.average).toFixed(2);
      console.log(`\n💡 Linked clone is ${formatPercentage(report.comparison.percentageDifference)} faster`);
      console.log(`   (${speedup}x speedup compared to full clone)`);
    } else if (report.comparison.fasterMethod === 'full') {
      const speedup = (report.linkedCloneMetrics.average / report.fullCloneMetrics.average).toFixed(2);
      console.log(`\n💡 Full clone is ${formatPercentage(report.comparison.percentageDifference)} faster`);
      console.log(`   (${speedup}x speedup compared to linked clone)`);
    }

    // Per-Node Analysis (if results available)
    if (data.results && data.results.length > 0) {
      console.log('\n' + '─'.repeat(80));
      console.log('PER-NODE ANALYSIS');
      console.log('─'.repeat(80));

      // Group by target node
      const byNode: Record<string, any[]> = {};
      data.results.forEach(result => {
        if (!byNode[result.targetNode]) {
          byNode[result.targetNode] = [];
        }
        byNode[result.targetNode].push(result);
      });

      Object.entries(byNode).forEach(([node, nodeResults]) => {
        const successful = nodeResults.filter(r => r.success).length;
        const failed = nodeResults.filter(r => r.success === false).length;
        const avgDuration = nodeResults
          .filter(r => r.success)
          .reduce((sum, r) => sum + r.duration, 0) / successful;

        console.log(`\n📍 ${node}:`);
        console.log(`   Tests: ${nodeResults.length} (✅ ${successful}, ❌ ${failed})`);
        if (successful > 0) {
          console.log(`   Avg Duration: ${formatDuration(avgDuration)}`);
        }
      });
    }

    // Test Details (if available)
    if (data.results && data.results.length > 0) {
      console.log('\n' + '─'.repeat(80));
      console.log('TEST DETAILS');
      console.log('─'.repeat(80) + '\n');

      // Group by clone type
      const linkedTests = data.results.filter(r => r.cloneType === 'linked');
      const fullTests = data.results.filter(r => r.cloneType === 'full');

      if (linkedTests.length > 0) {
        console.log('🔗 Linked Clone Tests:');
        linkedTests.forEach((test, idx) => {
          const status = test.success ? '✅' : '❌';
          const duration = test.success ? formatDuration(test.duration) : 'N/A';
          console.log(`   ${idx + 1}. VM ${test.newid} → ${test.targetNode} ${status} ${duration}`);
        });
      }

      if (fullTests.length > 0) {
        console.log('\n💿 Full Clone Tests:');
        fullTests.forEach((test, idx) => {
          const status = test.success ? '✅' : '❌';
          const duration = test.success ? formatDuration(test.duration) : 'N/A';
          console.log(`   ${idx + 1}. VM ${test.newid} → ${test.targetNode} ${status} ${duration}`);
        });
      }
    }

    console.log('\n' + '═'.repeat(80) + '\n');

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        console.error(`\n❌ Error: Report file not found: ${reportPath}\n`);
      } else if (error.message.includes('JSON')) {
        console.error(`\n❌ Error: Invalid JSON format in file: ${reportPath}\n`);
      } else {
        console.error(`\n❌ Error: ${error.message}\n`);
      }
    } else {
      console.error(`\n❌ Unknown error occurred\n`);
    }
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Show Performance Test Report

Usage:
  bun show-report.ts <report-file.json> [options]

Arguments:
  report-file.json    Path to the JSON report file

Options:
  --table, -t        Display as comparison table (default: detailed report)
  --help, -h         Show this help message

Examples:
  # Detailed report
  bun show-report.ts report-test.json

  # Table comparison view
  bun show-report.ts report-test.json --table
  bun show-report.ts report-test.json -t

  # With npm script
  bun run perf:show report-test.json --table
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const reportPath = args[0];
  const useTable = args.includes('--table') || args.includes('-t');

  if (useTable) {
    displayTableComparison(reportPath);
  } else {
    displayReport(reportPath);
  }
}

main();
