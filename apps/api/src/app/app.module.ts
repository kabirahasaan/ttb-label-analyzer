import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { LabelModule } from './label/label.module';
import { ApplicationModule } from './application/application.module';
import { ValidationModule } from './validation/validation.module';
import { BatchModule } from './batch/batch.module';
import { LoggerModule } from '@ttb/logger';
import { ConfigModule } from '@ttb/config';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    HealthModule,
    LabelModule,
    ApplicationModule,
    ValidationModule,
    BatchModule,
  ],
})
export class AppModule {}
