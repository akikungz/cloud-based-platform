/**
 * Examples of using the enhanced retry functionality
 */

import { RetryHandler, RetryConfigBuilder } from './retry';

// Example operation that might fail
async function unstableOperation(): Promise<string> {
  if (Math.random() < 0.7) {
    throw new Error('Random failure');
  }
  return 'Success!';
}

/**
 * Example 1: Simple retry with custom count and fixed delay
 */
export async function example1_customRetry() {
  try {
    const result = await RetryHandler.withCustomRetry(
      unstableOperation,
      { operation: 'example_operation' },
      5, // 5 retries
      2000 // 2 second delay between attempts
    );
    console.log('Result:', result);
  } catch (error) {
    console.error('Failed after all retries:', error);
  }
}

/**
 * Example 2: Exponential backoff with custom parameters
 */
export async function example2_exponentialBackoff() {
  try {
    const result = await RetryHandler.withExponentialBackoff(
      unstableOperation,
      { operation: 'exponential_example' },
      4, // 4 retries
      500, // Start with 500ms
      3 // Triple the delay each time (500ms, 1.5s, 4.5s, 13.5s)
    );
    console.log('Result:', result);
  } catch (error) {
    console.error('Failed after exponential backoff:', error);
  }
}

/**
 * Example 3: Linear backoff
 */
export async function example3_linearBackoff() {
  try {
    const result = await RetryHandler.withLinearBackoff(
      unstableOperation,
      { operation: 'linear_example' },
      3, // 3 retries
      1000 // Delays: 1s, 2s, 3s
    );
    console.log('Result:', result);
  } catch (error) {
    console.error('Failed after linear backoff:', error);
  }
}

/**
 * Example 4: Custom delay function
 */
export async function example4_customDelay() {
  try {
    const result = await RetryHandler.withCustomDelay(
      unstableOperation,
      { operation: 'custom_delay_example' },
      4,
      (attempt, baseDelay) => {
        // Fibonacci-like delay: each delay is sum of previous two
        const delays = [1000, 1000, 2000, 3000, 5000];
        return delays[attempt] || 5000;
      }
    );
    console.log('Result:', result);
  } catch (error) {
    console.error('Failed after custom delay:', error);
  }
}

/**
 * Example 5: Retry with jitter to avoid thundering herd
 */
export async function example5_withJitter() {
  try {
    const result = await RetryHandler.withJitter(
      unstableOperation,
      { operation: 'jitter_example' },
      3, // 3 retries
      1000, // Base delay of 1s
      500 // Up to 500ms of random jitter added
    );
    console.log('Result:', result);
  } catch (error) {
    console.error('Failed after jittered retries:', error);
  }
}

/**
 * Example 6: Using the configuration builder for complex scenarios
 */
export async function example6_configBuilder() {
  try {
    const config = RetryHandler.createConfig()
      .retries(5)
      .delay(800)
      .maxDelay(10000)
      .exponentialBackoff(1.5)
      .withJitter(200)
      .retryOn(['NETWORK_ERROR', 'CONNECTION_TIMEOUT'])
      .build();

    const result = await RetryHandler.executeWithRetry(
      unstableOperation,
      { operation: 'builder_example' },
      config
    );
    console.log('Result:', result);
  } catch (error) {
    console.error('Failed with custom config:', error);
  }
}

/**
 * Example 7: PVE API operation with retry
 */
export async function example7_pveApiRetry() {
  // Mock PVE API operation
  async function mockPveOperation(params: { node: string; vmid: number }) {
    if (Math.random() < 0.6) {
      throw new Error('PVE API temporarily unavailable');
    }
    return { status: 'success', data: `VM ${params.vmid} on ${params.node}` };
  }

  try {
    const wrappedOperation = RetryHandler.createPVERetryWrapper(
      mockPveOperation,
      {
        maxRetries: 3,
        baseDelay: 1500,
        strategy: 'exponential',
        backoffMultiplier: 2
      }
    );

    const result = await wrappedOperation({ node: 'pve-node-1', vmid: 100 });
    console.log('PVE Result:', result);
  } catch (error) {
    console.error('PVE operation failed:', error);
  }
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🔄 Running retry examples...\n');

  console.log('Example 1: Custom retry with fixed delay');
  await example1_customRetry();
  console.log('');

  console.log('Example 2: Exponential backoff');
  await example2_exponentialBackoff();
  console.log('');

  console.log('Example 3: Linear backoff');
  await example3_linearBackoff();
  console.log('');

  console.log('Example 4: Custom delay function');
  await example4_customDelay();
  console.log('');

  console.log('Example 5: Retry with jitter');
  await example5_withJitter();
  console.log('');

  console.log('Example 6: Configuration builder');
  await example6_configBuilder();
  console.log('');

  console.log('Example 7: PVE API retry wrapper');
  await example7_pveApiRetry();
  console.log('');

  console.log('✅ All examples completed!');
}