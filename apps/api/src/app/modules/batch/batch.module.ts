import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { LabelModule } from '../label/label.module';
import { ValidationModule } from '../validation/validation.module';
import { LoggerModule } from '@ttb/logger';

@Module({
  imports: [LabelModule, ValidationModule, LoggerModule],
  controllers: [BatchController],
  providers: [BatchService],
})
export class BatchModule {}
