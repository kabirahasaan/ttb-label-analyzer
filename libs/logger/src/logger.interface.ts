/**
 * Logger interfaces
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  traceId?: string;
  userId?: string;
  [key: string]: unknown;
}

export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  setContext(context: LogContext): void;
}

export interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'text';
  includeTimestamp?: boolean;
  includeStackTrace?: boolean;
}
