import { Module } from '@nestjs/common';
import { ValidationController } from './validation.controller';
import { ValidateService } from './validation.service';
import { LabelModule } from '../label/label.module';
import { ApplicationModule } from '../application/application.module';
import { LoggerModule } from '@ttb/logger';

@Module({
  imports: [LabelModule, ApplicationModule, LoggerModule],
  controllers: [ValidationController],
  providers: [ValidateService],
  exports: [ValidateService],
})
export class ValidationModule {}
