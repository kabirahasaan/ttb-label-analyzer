import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

/**
 * Logger Module for NestJS
 */
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}

export const createLogger = (level: 'debug' | 'info' | 'warn' | 'error' = 'info') => {
  return new LoggerService({
    level: level as any,
    format: process.env.LOG_FORMAT as 'json' | 'text' | undefined,
  });
};
