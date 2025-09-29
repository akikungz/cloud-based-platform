import { YuzuError, ErrorSeverity } from './types';
import { ErrorHandler } from './handler';
import { logger } from '../log';

/**
 * Retry configuration options
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // Base delay in milliseconds
  maxDelay: number; // Maximum delay in milliseconds
  backoffMultiplier: number; // Exponential backoff multiplier
  retryableErrors: string[]; // Error codes that should be retried
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
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
   * Calculates delay for next retry attempt using exponential backoff
   */
  private static calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
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
}
