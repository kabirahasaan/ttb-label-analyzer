import { LogLevel, LogContext, ILogger, LoggerConfig } from './logger.interface';

/**
 * Production-grade logger service
 */
export class LoggerService implements ILogger {
  private context: LogContext = {};
  private level: LogLevel;
  private format: 'json' | 'text';
  private includeTimestamp: boolean;
  private includeStackTrace: boolean;

  constructor(config: LoggerConfig = { level: LogLevel.INFO, format: 'json' }) {
    this.level = config.level;
    this.format = config.format;
    this.includeTimestamp = config.includeTimestamp !== false;
    this.includeStackTrace = config.includeStackTrace !== false;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.log(LogLevel.INFO, message, context);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.log(LogLevel.WARN, message, context);
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const enrichedContext = {
        ...context,
        ...(error && {
          errorName: error.name,
          errorMessage: error.message,
          ...(this.includeStackTrace && { stack: error.stack }),
        }),
      };
      this.log(LogLevel.ERROR, message, enrichedContext);
    }
  }

  setContext(context: LogContext): void {
    this.context = context;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const mergedContext = { ...this.context, ...context };

    if (this.format === 'json') {
      this.logJson(level, message, mergedContext);
    } else {
      this.logText(level, message, mergedContext);
    }
  }

  private logJson(level: LogLevel, message: string, context: LogContext): void {
    const logObject: Record<string, unknown> = {
      level,
      message,
    };

    if (this.includeTimestamp) {
      logObject.timestamp = new Date().toISOString();
    }

    if (Object.keys(context).length > 0) {
      logObject.meta = context;
    }

    console.log(JSON.stringify(logObject));
  }

  private logText(level: LogLevel, message: string, context: LogContext): void {
    let logMessage = `[${level.toUpperCase()}]`;

    if (this.includeTimestamp) {
      logMessage += ` ${new Date().toISOString()}`;
    }

    logMessage += ` ${message}`;

    if (Object.keys(context).length > 0) {
      logMessage += ` ${JSON.stringify(context)}`;
    }

    console.log(logMessage);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentIndex = levels.indexOf(this.level);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }
}
