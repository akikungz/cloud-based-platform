import { AxiosError } from 'axios';

/**
 * Base error class for all Yuzu-related errors
 */
export class YuzuError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;
  public readonly retryable: boolean;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'YuzuError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
    this.retryable = retryable;
  }
}

/**
 * PVE API specific errors
 */
export class PVEAPIError extends YuzuError {
  public readonly statusCode?: number;
  public readonly endpoint?: string;
  public readonly method?: string;

  constructor(
    message: string,
    statusCode?: number,
    endpoint?: string,
    method?: string,
    context?: Record<string, unknown>
  ) {
    super(
      message,
      'PVE_API_ERROR',
      { ...context, statusCode, endpoint, method },
      isRetryableStatusCode(statusCode)
    );
    this.name = 'PVEAPIError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.method = method;
  }
}

/**
 * Network/connection errors
 */
export class NetworkError extends YuzuError {
  public readonly originalError?: Error;

  constructor(
    message: string,
    originalError?: Error,
    context?: Record<string, unknown>
  ) {
    super(message, 'NETWORK_ERROR', context, true);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

/**
 * Validation errors
 */
export class ValidationError extends YuzuError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(
    message: string,
    field?: string,
    value?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', { ...context, field, value }, false);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Task execution errors
 */
export class TaskError extends YuzuError {
  public readonly taskId?: string;
  public readonly exitStatus?: string;

  constructor(
    message: string,
    taskId?: string,
    exitStatus?: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'TASK_ERROR', { ...context, taskId, exitStatus }, false);
    this.name = 'TaskError';
    this.taskId = taskId;
    this.exitStatus = exitStatus;
  }
}

/**
 * Error context for better debugging
 */
export interface ErrorContext {
  operation: string;
  node?: string;
  vmid?: number;
  requestId?: string;
  userId?: string;
  timestamp: Date;
  additional?: Record<string, unknown>;
  [key: string]: unknown; // Index signature for flexibility
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Enhanced error information
 */
export interface ErrorInfo {
  error: YuzuError;
  severity: ErrorSeverity;
  context: ErrorContext;
  stack?: string;
  retryCount?: number;
  maxRetries?: number;
}

/**
 * Determines if an HTTP status code represents a retryable error
 */
function isRetryableStatusCode(statusCode?: number): boolean {
  if (!statusCode) return true; // Network errors are retryable
  
  // 5xx server errors are retryable
  if (statusCode >= 500) return true;
  
  // 429 Too Many Requests is retryable
  if (statusCode === 429) return true;
  
  // 408 Request Timeout is retryable
  if (statusCode === 408) return true;
  
  return false;
}

/**
 * Error codes for different types of failures
 */
export const ErrorCodes = {
  // PVE API errors
  PVE_API_ERROR: 'PVE_API_ERROR',
  PVE_AUTHENTICATION_FAILED: 'PVE_AUTHENTICATION_FAILED',
  PVE_PERMISSION_DENIED: 'PVE_PERMISSION_DENIED',
  PVE_RESOURCE_NOT_FOUND: 'PVE_RESOURCE_NOT_FOUND',
  PVE_RESOURCE_CONFLICT: 'PVE_RESOURCE_CONFLICT',
  PVE_VALIDATION_ERROR: 'PVE_VALIDATION_ERROR',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',
  DNS_RESOLUTION_FAILED: 'DNS_RESOLUTION_FAILED',
  
  // Task errors
  TASK_ERROR: 'TASK_ERROR',
  TASK_TIMEOUT: 'TASK_TIMEOUT',
  TASK_FAILED: 'TASK_FAILED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  FOREIGN_KEY_CONSTRAINT: 'FOREIGN_KEY_CONSTRAINT',
  UNIQUE_CONSTRAINT_VIOLATION: 'UNIQUE_CONSTRAINT_VIOLATION',
  
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
