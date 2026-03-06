"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const logger_interface_1 = require("./logger.interface");
/**
 * Production-grade logger service
 */
class LoggerService {
    constructor(config = { level: logger_interface_1.LogLevel.INFO, format: 'json' }) {
        this.context = {};
        this.level = config.level;
        this.format = config.format;
        this.includeTimestamp = config.includeTimestamp !== false;
        this.includeStackTrace = config.includeStackTrace !== false;
    }
    debug(message, context) {
        if (this.shouldLog(logger_interface_1.LogLevel.DEBUG)) {
            this.log(logger_interface_1.LogLevel.DEBUG, message, context);
        }
    }
    info(message, context) {
        if (this.shouldLog(logger_interface_1.LogLevel.INFO)) {
            this.log(logger_interface_1.LogLevel.INFO, message, context);
        }
    }
    warn(message, context) {
        if (this.shouldLog(logger_interface_1.LogLevel.WARN)) {
            this.log(logger_interface_1.LogLevel.WARN, message, context);
        }
    }
    error(message, error, context) {
        if (this.shouldLog(logger_interface_1.LogLevel.ERROR)) {
            const enrichedContext = {
                ...context,
                ...(error && {
                    errorName: error.name,
                    errorMessage: error.message,
                    ...(this.includeStackTrace && { stack: error.stack }),
                }),
            };
            this.log(logger_interface_1.LogLevel.ERROR, message, enrichedContext);
        }
    }
    setContext(context) {
        this.context = context;
    }
    log(level, message, context) {
        const mergedContext = { ...this.context, ...context };
        if (this.format === 'json') {
            this.logJson(level, message, mergedContext);
        }
        else {
            this.logText(level, message, mergedContext);
        }
    }
    logJson(level, message, context) {
        const logObject = {
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
    logText(level, message, context) {
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
    shouldLog(level) {
        const levels = [logger_interface_1.LogLevel.DEBUG, logger_interface_1.LogLevel.INFO, logger_interface_1.LogLevel.WARN, logger_interface_1.LogLevel.ERROR];
        const currentIndex = levels.indexOf(this.level);
        const messageIndex = levels.indexOf(level);
        return messageIndex >= currentIndex;
    }
}
exports.LoggerService = LoggerService;
//# sourceMappingURL=logger.service.js.map