# Utils Package

## Overview
The Utils package provides common utility functions and helpers used across the Cloud-Based Platform applications. It includes logging, validation, error handling, and other shared functionality.

## Features
- Structured logging with Pino
- Error handling utilities
- Common validation functions
- Date and time helpers
- Configuration management

## Installation

```bash
bun install
```

## Usage

### Logging

```typescript
import { logger } from '@cloud-platform/utils/functions/logger';

// Log information
logger.info('Operation successful', { userId: 123 });

// Log errors
try {
  // Some operation
} catch (error) {
  logger.error('Operation failed', { error });
}
```

### Validation

```typescript
import { validateInput } from '@cloud-platform/utils/functions/validation';

const result = validateInput(userInput, userSchema);
if (!result.success) {
  console.error('Invalid input:', result.errors);
}
```

### Error Handling

```typescript
import { AppError, handleError } from '@cloud-platform/utils/functions/errors';

try {
  // Some operation
} catch (error) {
  if (error instanceof AppError) {
    // Handle application-specific error
  } else {
    // Handle unexpected error
    handleError(error);
  }
}
```

## Available Utilities

- **Logger**: Structured logging with Pino
- **Validation**: Input validation helpers
- **Errors**: Error handling and custom error classes
- **DateTime**: Date and time manipulation functions
- **Config**: Configuration management
- **Constants**: Shared constants and enums

## Development

```bash
# Run tests
bun test

# Build package
bun run build
```
