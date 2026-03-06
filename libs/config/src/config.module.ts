import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';

/**
 * Config Module for NestJS
 */
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
