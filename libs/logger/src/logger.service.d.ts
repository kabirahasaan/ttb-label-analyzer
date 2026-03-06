import { LogContext, ILogger, LoggerConfig } from './logger.interface';
/**
 * Production-grade logger service
 */
export declare class LoggerService implements ILogger {
    private context;
    private level;
    private format;
    private includeTimestamp;
    private includeStackTrace;
    constructor(config?: LoggerConfig);
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, error?: Error, context?: LogContext): void;
    setContext(context: LogContext): void;
    private log;
    private logJson;
    private logText;
    private shouldLog;
}
//# sourceMappingURL=logger.service.d.ts.map