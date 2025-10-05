/**
 * Enhanced Retry Library for Yuzu PVE Operations
 * 
 * This module provides sophisticated retry mechanisms for handling transient failures
 * in PVE API operations and other async operations. It supports multiple retry strategies,
 * custom delays, jitter, and flexible configuration options.
 * 
 * Features:
 * - Multiple retry strategies: fixed, linear, exponential, custom
 * - Configurable retry count and delays
 * - Jitter support to prevent thundering herd problems
 * - Fluent configuration builder API
 * - Convenient static methods for common scenarios
 * - PVE API specific retry wrapper
 * 
 * Quick Examples:
 * 
 * ```typescript
 * // Simple custom retry with fixed delay
 * await RetryHandler.withCustomRetry(
 *   () => apiCall(),
 *   { operation: 'api_call' },
 *   5,    // 5 retries
 *   2000  // 2 second delay
 * );
 * 
 * // Exponential backoff
 * await RetryHandler.withExponentialBackoff(
 *   () => apiCall(),
 *   { operation: 'api_call' },
 *   3,    // 3 retries
 *   1000, // 1 second base delay
 *   2     // double each time
 * );
 * 
 * // Using configuration builder
 * const config = RetryHandler.createConfig()
 *   .retries(5)
 *   .delay(1000)
 *   .exponentialBackoff(1.5)
 *   .withJitter(200)
 *   .build();
 * 
 * await RetryHandler.executeWithRetry(operation, context, config);
 * ```
 * 
 * @see retry-examples.ts for more comprehensive usage examples
 */

import { YuzuError, ErrorSeverity } from './types';
import { ErrorHandler } from './handler';
import { logger } from '../log';

/**
 * Retry strategy types
 */
export type RetryStrategy = 'fixed' | 'exponential' | 'linear' | 'custom';

/**
 * Custom delay function type
 */
export type CustomDelayFunction = (attempt: number, baseDelay: number) => number;

/**
 * Retry configuration options
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // Base delay in milliseconds
  maxDelay: number; // Maximum delay in milliseconds
  backoffMultiplier: number; // Exponential backoff multiplier
  retryableErrors: string[]; // Error codes that should be retried
  strategy: RetryStrategy; // Retry strategy to use
  customDelayFn?: CustomDelayFunction; // Custom delay function for 'custom' strategy
  jitter: boolean; // Add random jitter to delays
  jitterMax: number; // Maximum jitter amount in milliseconds
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  strategy: 'exponential',
  jitter: false,
  jitterMax: 100,
  retryableErrors: [
    'NETWORK_ERROR',
    'PVE_API_ERROR', // Only for 5xx status codes
    'CONNECTION_TIMEOUT',
    'CONNECTION_REFUSED'
  ]
};

/**
 * Retry utility for handling transient errors
 */
export class RetryHandler {
  /**
   * Executes a function with retry logic
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: {
      operation: string;
      node?: string;
      vmid?: number;
      requestId?: string;
      userId?: string;
    },
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastError: YuzuError | null = null;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const result = await operation();

        // Log successful retry if this wasn't the first attempt
        if (attempt > 0) {
          logger.info({ operation: context.operation, attempt: attempt + 1 }, '✅ Operation succeeded on retry attempt');
        }

        return result;
      } catch (error) {
        const yuzuError = ErrorHandler.handleError(error, {
          ...context,
          additional: { attempt: attempt + 1, maxRetries: retryConfig.maxRetries }
        });

        lastError = yuzuError;

        // Don't retry if this is the last attempt
        if (attempt === retryConfig.maxRetries) {
          break;
        }

        // Don't retry if error is not retryable
        if (!this.shouldRetry(yuzuError, retryConfig)) {
          logger.info({ operation: context.operation, error: yuzuError.message }, '❌ Error is not retryable');
          break;
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, retryConfig);

        logger.info({
          operation: context.operation,
          delay,
          attempt: attempt + 2,
          maxRetries: retryConfig.maxRetries + 1,
          error: yuzuError.message
        }, '🔄 Retrying operation after delay');

        await this.sleep(delay);
      }
    }

    // If we get here, all retries failed
    if (lastError) {
      logger.error({
        operation: context.operation,
        attempts: retryConfig.maxRetries + 1,
        error: lastError.message
      }, '💥 Operation failed after all retry attempts');
      throw lastError;
    }

    throw new YuzuError(
      'Retry operation failed with unknown error',
      'RETRY_FAILED',
      context
    );
  }

  /**
   * Determines if an error should be retried
   */
  private static shouldRetry(error: YuzuError, config: RetryConfig): boolean {
    // Don't retry if error is not marked as retryable
    if (!error.retryable) {
      return false;
    }

    // Check if error code is in retryable list
    if (!config.retryableErrors.includes(error.code)) {
      return false;
    }

    // For PVE API errors, only retry on server errors (5xx)
    if (error.code === 'PVE_API_ERROR' && 'statusCode' in error) {
      const statusCode = (error as any).statusCode;
      return statusCode >= 500;
    }

    return true;
  }

  /**
   * Calculates delay for next retry attempt based on strategy
   */
  private static calculateDelay(attempt: number, config: RetryConfig): number {
    let delay: number;

    switch (config.strategy) {
      case 'fixed':
        delay = config.baseDelay;
        break;

      case 'linear':
        delay = config.baseDelay * (attempt + 1);
        break;

      case 'exponential':
        delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
        break;

      case 'custom':
        if (config.customDelayFn) {
          delay = config.customDelayFn(attempt, config.baseDelay);
        } else {
          // Fallback to exponential if no custom function provided
          delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
        }
        break;

      default:
        delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
    }

    // Apply jitter if enabled
    if (config.jitter) {
      const jitterAmount = Math.random() * config.jitterMax;
      delay += jitterAmount;
    }

    // Ensure delay doesn't exceed maximum
    return Math.min(delay, config.maxDelay);
  }

  /**
   * Sleep utility for delays
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Creates a retry wrapper for PVE API operations
   */
  static createPVERetryWrapper<T extends any[], R>(
    operation: (...args: T) => Promise<R>,
    config: Partial<RetryConfig> = {}
  ) {
    return async (...args: T): Promise<R> => {
      // Extract context from arguments (assuming first arg has node, vmid, etc.)
      const context = {
        operation: operation.name || 'pve_operation',
        node: (args[0] as any)?.node,
        vmid: (args[0] as any)?.vmid,
        requestId: (args[0] as any)?.requestId,
        userId: (args[0] as any)?.userId
      };

      return this.executeWithRetry(
        () => operation(...args),
        context,
        config
      );
    };
  }

  /**
   * Quick retry with custom count and fixed delay
   */
  static async withCustomRetry<T>(
    operation: () => Promise<T>,
    context: {
      operation: string;
      node?: string;
      vmid?: number;
      requestId?: string;
      userId?: string;
    },
    retries: number,
    delayMs: number
  ): Promise<T> {
    return this.executeWithRetry(operation, context, {
      maxRetries: retries,
      baseDelay: delayMs,
      strategy: 'fixed'
    });
  }

  /**
   * Quick retry with exponential backoff
   */
  static async withExponentialBackoff<T>(
    operation: () => Promise<T>,
    context: {
      operation: string;
      node?: string;
      vmid?: number;
      requestId?: string;
      userId?: string;
    },
    retries: number = 3,
    baseDelayMs: number = 1000,
    multiplier: number = 2
  ): Promise<T> {
    return this.executeWithRetry(operation, context, {
      maxRetries: retries,
      baseDelay: baseDelayMs,
      backoffMultiplier: multiplier,
      strategy: 'exponential'
    });
  }

  /**
   * Quick retry with linear backoff
   */
  static async withLinearBackoff<T>(
    operation: () => Promise<T>,
    context: {
      operation: string;
      node?: string;
      vmid?: number;
      requestId?: string;
      userId?: string;
    },
    retries: number = 3,
    baseDelayMs: number = 1000
  ): Promise<T> {
    return this.executeWithRetry(operation, context, {
      maxRetries: retries,
      baseDelay: baseDelayMs,
      strategy: 'linear'
    });
  }

  /**
   * Retry with custom delay function
   */
  static async withCustomDelay<T>(
    operation: () => Promise<T>,
    context: {
      operation: string;
      node?: string;
      vmid?: number;
      requestId?: string;
      userId?: string;
    },
    retries: number,
    delayFn: CustomDelayFunction
  ): Promise<T> {
    return this.executeWithRetry(operation, context, {
      maxRetries: retries,
      strategy: 'custom',
      customDelayFn: delayFn,
      baseDelay: 1000 // Used as parameter for custom function
    });
  }

  /**
   * Simple retry with jitter to avoid thundering herd
   */
  static async withJitter<T>(
    operation: () => Promise<T>,
    context: {
      operation: string;
      node?: string;
      vmid?: number;
      requestId?: string;
      userId?: string;
    },
    retries: number = 3,
    baseDelayMs: number = 1000,
    jitterMaxMs: number = 500
  ): Promise<T> {
    return this.executeWithRetry(operation, context, {
      maxRetries: retries,
      baseDelay: baseDelayMs,
      strategy: 'exponential',
      jitter: true,
      jitterMax: jitterMaxMs
    });
  }

  /**
   * Create a retry configuration builder for more complex scenarios
   */
  static createConfig(): RetryConfigBuilder {
    return new RetryConfigBuilder();
  }
}

/**
 * Builder class for creating retry configurations
 */
export class RetryConfigBuilder {
  private config: Partial<RetryConfig> = {};

  /**
   * Set maximum number of retries
   */
  retries(count: number): RetryConfigBuilder {
    this.config.maxRetries = count;
    return this;
  }

  /**
   * Set base delay in milliseconds
   */
  delay(ms: number): RetryConfigBuilder {
    this.config.baseDelay = ms;
    return this;
  }

  /**
   * Set maximum delay in milliseconds
   */
  maxDelay(ms: number): RetryConfigBuilder {
    this.config.maxDelay = ms;
    return this;
  }

  /**
   * Use fixed delay strategy
   */
  fixedDelay(): RetryConfigBuilder {
    this.config.strategy = 'fixed';
    return this;
  }

  /**
   * Use exponential backoff strategy
   */
  exponentialBackoff(multiplier: number = 2): RetryConfigBuilder {
    this.config.strategy = 'exponential';
    this.config.backoffMultiplier = multiplier;
    return this;
  }

  /**
   * Use linear backoff strategy
   */
  linearBackoff(): RetryConfigBuilder {
    this.config.strategy = 'linear';
    return this;
  }

  /**
   * Use custom delay function
   */
  customDelay(fn: CustomDelayFunction): RetryConfigBuilder {
    this.config.strategy = 'custom';
    this.config.customDelayFn = fn;
    return this;
  }

  /**
   * Enable jitter with optional maximum jitter amount
   */
  withJitter(maxJitterMs: number = 100): RetryConfigBuilder {
    this.config.jitter = true;
    this.config.jitterMax = maxJitterMs;
    return this;
  }

  /**
   * Set retryable error codes
   */
  retryOn(errorCodes: string[]): RetryConfigBuilder {
    this.config.retryableErrors = errorCodes;
    return this;
  }

  /**
   * Build the final configuration
   */
  build(): Partial<RetryConfig> {
    return { ...this.config };
  }
}
