import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { LabelModule } from './modules/label/label.module';
import { ApplicationModule } from './modules/application/application.module';
import { ValidationModule } from './modules/validation/validation.module';
import { BatchModule } from './modules/batch/batch.module';
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
