import { AxiosError } from 'axios';
import { logger } from '../log';
import {
  YuzuError,
  PVEAPIError,
  NetworkError,
  ValidationError,
  TaskError,
  ErrorContext,
  ErrorInfo,
  ErrorSeverity,
  ErrorCodes
} from './types';

/**
 * Centralized error handler for Yuzu service
 */
export class ErrorHandler {
  /**
   * Converts an AxiosError to a more readable YuzuError
   */
  static fromAxiosError(
    error: AxiosError,
    context: Partial<ErrorContext> = {}
  ): YuzuError {
    const errorContext: ErrorContext = {
      operation: context.operation || 'unknown',
      node: context.node,
      vmid: context.vmid,
      requestId: context.requestId,
      userId: context.userId,
      timestamp: new Date(),
      additional: {
        ...context.additional,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText
      }
    };

    // Network/connection errors
    if (!error.response) {
      if (error.code === 'ECONNREFUSED') {
        return new NetworkError(
          `Connection refused to ${error.config?.baseURL || 'PVE server'}`,
          error,
          errorContext
        );
      }

      if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
        return new NetworkError(
          `DNS resolution failed for ${error.config?.baseURL || 'PVE server'}`,
          error,
          errorContext
        );
      }

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return new NetworkError(
          `Request timeout to ${error.config?.baseURL || 'PVE server'}`,
          error,
          errorContext
        );
      }

      return new NetworkError(
        `Network error: ${error.message}`,
        error,
        errorContext
      );
    }

    // HTTP response errors
    const statusCode = error.response.status;
    const responseData = error.response.data as any;

    // Extract meaningful error message from PVE response
    let errorMessage = `HTTP ${statusCode}: ${error.response.statusText}`;

    if (responseData) {
      if (typeof responseData === 'string') {
        errorMessage = responseData;
      } else if (responseData.errors) {
        // PVE API often returns errors in this format
        const errors = Array.isArray(responseData.errors)
          ? responseData.errors
          : [responseData.errors];
        errorMessage = errors.map((e: any) => e.message || e).join(', ');
      } else if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.data && responseData.data.message) {
        errorMessage = responseData.data.message;
      }
    }

    // Create specific error types based on status code
    switch (statusCode) {
      case 401:
        return new PVEAPIError(
          `Authentication failed: ${errorMessage}`,
          statusCode,
          error.config?.url,
          error.config?.method,
          { ...errorContext, originalMessage: errorMessage }
        );

      case 403:
        return new PVEAPIError(
          `Permission denied: ${errorMessage}`,
          statusCode,
          error.config?.url,
          error.config?.method,
          { ...errorContext, originalMessage: errorMessage }
        );

      case 404:
        return new PVEAPIError(
          `Resource not found: ${errorMessage}`,
          statusCode,
          error.config?.url,
          error.config?.method,
          { ...errorContext, originalMessage: errorMessage }
        );

      case 409:
        return new PVEAPIError(
          `Resource conflict: ${errorMessage}`,
          statusCode,
          error.config?.url,
          error.config?.method,
          { ...errorContext, originalMessage: errorMessage }
        );

      case 422:
        return new PVEAPIError(
          `Validation error: ${errorMessage}`,
          statusCode,
          error.config?.url,
          error.config?.method,
          { ...errorContext, originalMessage: errorMessage }
        );

      case 429:
        return new PVEAPIError(
          `Rate limit exceeded: ${errorMessage}`,
          statusCode,
          error.config?.url,
          error.config?.method,
          { ...errorContext, originalMessage: errorMessage }
        );

      case 500:
      case 502:
      case 503:
      case 504:
        return new PVEAPIError(
          `Server error: ${errorMessage}`,
          statusCode,
          error.config?.url,
          error.config?.method,
          { ...errorContext, originalMessage: errorMessage }
        );

      default:
        return new PVEAPIError(
          errorMessage,
          statusCode,
          error.config?.url,
          error.config?.method,
          { ...errorContext, originalMessage: errorMessage }
        );
    }
  }

  /**
   * Creates a validation error with context
   */
  static createValidationError(
    message: string,
    field?: string,
    value?: unknown,
    context: Partial<ErrorContext> = {}
  ): ValidationError {
    return new ValidationError(
      message,
      field,
      value,
      {
        operation: context.operation || 'validation',
        timestamp: new Date(),
        ...context
      }
    );
  }

  /**
   * Creates a task error with context
   */
  static createTaskError(
    message: string,
    taskId?: string,
    exitStatus?: string,
    context: Partial<ErrorContext> = {}
  ): TaskError {
    return new TaskError(
      message,
      taskId,
      exitStatus,
      {
        operation: context.operation || 'task_execution',
        timestamp: new Date(),
        ...context
      }
    );
  }

  /**
   * Determines error severity based on error type and context
   */
  static getErrorSeverity(error: YuzuError): ErrorSeverity {
    // Critical errors that require immediate attention
    if (error instanceof PVEAPIError) {
      if (error.statusCode === 401 || error.statusCode === 403) {
        return ErrorSeverity.CRITICAL; // Authentication/permission issues
      }
      if (error.statusCode && error.statusCode >= 500) {
        return ErrorSeverity.HIGH; // Server errors
      }
      if (error.statusCode === 404) {
        return ErrorSeverity.MEDIUM; // Resource not found
      }
      return ErrorSeverity.LOW; // Other API errors
    }

    // Network errors are usually medium severity
    if (error instanceof NetworkError) {
      return ErrorSeverity.MEDIUM;
    }

    // Validation errors are usually low severity
    if (error instanceof ValidationError) {
      return ErrorSeverity.LOW;
    }

    // Task errors depend on the operation
    if (error instanceof TaskError) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.MEDIUM;
  }

  /**
   * Creates comprehensive error information
   */
  static createErrorInfo(
    error: YuzuError,
    context: Partial<ErrorContext> = {}
  ): ErrorInfo {
    return {
      error,
      severity: this.getErrorSeverity(error),
      context: {
        operation: context.operation || 'unknown',
        node: context.node,
        vmid: context.vmid,
        requestId: context.requestId,
        userId: context.userId,
        timestamp: new Date(),
        additional: context.additional
      },
      stack: error.stack
    };
  }

  /**
   * Logs error information in a structured format
   */
  static logError(errorInfo: ErrorInfo): void {
    const logData = {
      timestamp: errorInfo.context.timestamp.toISOString(),
      severity: errorInfo.severity,
      error: {
        name: errorInfo.error.name,
        code: errorInfo.error.code,
        message: errorInfo.error.message,
        retryable: errorInfo.error.retryable
      },
      context: errorInfo.context,
      stack: errorInfo.stack
    };

    switch (errorInfo.severity) {
      case ErrorSeverity.CRITICAL:
        logger.error(logData, '🚨 CRITICAL ERROR');
        break;
      case ErrorSeverity.HIGH:
        logger.error(logData, '🔴 HIGH SEVERITY ERROR');
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn(logData, '🟡 MEDIUM SEVERITY ERROR');
        break;
      case ErrorSeverity.LOW:
        logger.info(logData, '🔵 LOW SEVERITY ERROR');
        break;
    }
  }

  /**
   * Handles and logs an error with context
   */
  static handleError(
    error: unknown,
    context: Partial<ErrorContext> = {}
  ): YuzuError {
    let yuzuError: YuzuError;

    if (error instanceof YuzuError) {
      yuzuError = error;
    } else if (error instanceof AxiosError) {
      yuzuError = this.fromAxiosError(error, context);
    } else if (error instanceof Error) {
      yuzuError = new YuzuError(
        error.message,
        ErrorCodes.UNKNOWN_ERROR,
        { ...context, originalError: error.message },
        false
      );
    } else {
      yuzuError = new YuzuError(
        `Unknown error: ${String(error)}`,
        ErrorCodes.UNKNOWN_ERROR,
        context,
        false
      );
    }

    const errorInfo = this.createErrorInfo(yuzuError, context);
    this.logError(errorInfo);

    return yuzuError;
  }
}
