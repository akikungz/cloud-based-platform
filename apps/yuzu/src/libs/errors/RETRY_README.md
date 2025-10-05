# Enhanced Retry Library

This enhanced retry library provides flexible and powerful retry mechanisms for handling transient failures in PVE operations and other async operations.

## Features

- ✅ **Multiple Retry Strategies**: Fixed delay, linear backoff, exponential backoff, and custom delay functions
- ✅ **Configurable Parameters**: Custom retry count, delays, and maximum delays
- ✅ **Jitter Support**: Random jitter to prevent thundering herd problems
- ✅ **Fluent Builder API**: Easy-to-use configuration builder
- ✅ **Convenience Methods**: Static methods for common retry scenarios
- ✅ **PVE API Integration**: Specialized wrapper for PVE API operations
- ✅ **Type Safety**: Full TypeScript support with proper types

## Retry Strategies

### 1. Fixed Delay
Same delay between each retry attempt.
```typescript
await RetryHandler.withCustomRetry(operation, context, 3, 2000); // 2s between retries
```

### 2. Linear Backoff
Delay increases linearly: baseDelay × attempt number.
```typescript
await RetryHandler.withLinearBackoff(operation, context, 3, 1000); // 1s, 2s, 3s
```

### 3. Exponential Backoff
Delay increases exponentially: baseDelay × multiplier^attempt.
```typescript
await RetryHandler.withExponentialBackoff(operation, context, 3, 1000, 2); // 1s, 2s, 4s
```

### 4. Custom Delay Function
Use your own delay calculation logic.
```typescript
await RetryHandler.withCustomDelay(operation, context, 3, (attempt, baseDelay) => {
  // Fibonacci sequence: 1s, 1s, 2s, 3s, 5s...
  const fibonacci = [1000, 1000, 2000, 3000, 5000];
  return fibonacci[attempt] || 5000;
});
```

## Quick Start Examples

### Basic Custom Retry
```typescript
import { RetryHandler } from './retry';

// Retry 5 times with 2 second delay
const result = await RetryHandler.withCustomRetry(
  () => myApiCall(),
  { operation: 'api_call' },
  5,    // retry count
  2000  // delay in milliseconds
);
```

### Exponential Backoff with Jitter
```typescript
// Prevents thundering herd when multiple clients retry simultaneously
const result = await RetryHandler.withJitter(
  () => myApiCall(),
  { operation: 'api_call' },
  3,    // retries
  1000, // base delay
  500   // max jitter (adds 0-500ms random delay)
);
```

### Advanced Configuration with Builder
```typescript
const config = RetryHandler.createConfig()
  .retries(5)
  .delay(800)
  .maxDelay(10000)
  .exponentialBackoff(1.5)
  .withJitter(200)
  .retryOn(['NETWORK_ERROR', 'CONNECTION_TIMEOUT'])
  .build();

const result = await RetryHandler.executeWithRetry(
  () => myApiCall(),
  { operation: 'complex_operation' },
  config
);
```

### PVE API Operations
```typescript
// Automatically wraps PVE API calls with retry logic
const wrappedPveCall = RetryHandler.createPVERetryWrapper(
  myPveApiFunction,
  {
    maxRetries: 3,
    baseDelay: 1500,
    strategy: 'exponential'
  }
);

const result = await wrappedPveCall({ node: 'pve-node-1', vmid: 100 });
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxRetries` | number | 3 | Maximum number of retry attempts |
| `baseDelay` | number | 1000 | Base delay in milliseconds |
| `maxDelay` | number | 30000 | Maximum delay cap in milliseconds |
| `backoffMultiplier` | number | 2 | Multiplier for exponential backoff |
| `strategy` | string | 'exponential' | Retry strategy: 'fixed', 'linear', 'exponential', 'custom' |
| `jitter` | boolean | false | Enable random jitter |
| `jitterMax` | number | 100 | Maximum jitter amount in milliseconds |
| `retryableErrors` | string[] | [...] | Array of error codes that should be retried |
| `customDelayFn` | function | undefined | Custom delay function for 'custom' strategy |

## Convenience Methods

| Method | Purpose |
|--------|---------|
| `withCustomRetry()` | Fixed delay with custom count and interval |
| `withExponentialBackoff()` | Exponential backoff with custom parameters |
| `withLinearBackoff()` | Linear backoff with custom parameters |
| `withCustomDelay()` | Custom delay function |
| `withJitter()` | Exponential backoff with jitter |
| `createPVERetryWrapper()` | Wrap PVE API functions with retry logic |
| `createConfig()` | Create a configuration builder |

## Error Handling

The retry system respects error types and only retries on transient errors:
- Network errors
- Connection timeouts
- PVE API 5xx errors
- Custom retryable error codes

Non-retryable errors (4xx client errors, validation errors) fail immediately.

## Examples

See `retry-examples.ts` for comprehensive usage examples including:
- All retry strategies
- PVE API integration
- Custom delay functions
- Configuration builder usage
- Error handling scenarios

## Migration from Previous Version

The enhanced retry library is backward compatible. Existing code using `executeWithRetry()` will continue to work unchanged. New features are additive and available through new convenience methods and configuration options.