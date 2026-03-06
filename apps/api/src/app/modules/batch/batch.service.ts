import { Injectable } from '@nestjs/common';
import { BatchValidateDto } from './batch.dto';
import { LabelService } from '../label/label.service';
import { ValidateService } from '../validation/validation.service';
import { BatchValidationResponse, ValidationStatus } from '@ttb/shared-types';
import { LoggerService } from '@ttb/logger';

/**
 * Batch Service
 * Handles batch validation operations
 */
@Injectable()
export class BatchService {
  constructor(
    private labelService: LabelService,
    private validateService: ValidateService,
    private logger: LoggerService
  ) {}

  async validateBatch(batchValidateDto: BatchValidateDto): Promise<BatchValidationResponse> {
    const startTime = new Date();
    const batchId = this.generateBatchId();

    this.logger.info(`Starting batch validation: ${batchId}`, {
      batchId,
      labelCount: batchValidateDto.labelIds.length,
    });

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const labelId of batchValidateDto.labelIds) {
      try {
        const validationResult = this.validateService.validateLabel(labelId);
        results.push(validationResult);
        successCount++;
      } catch (error) {
        this.logger.error(`Failed to validate label: ${labelId}`, error as Error);
        failureCount++;
      }
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    const response: BatchValidationResponse = {
      batchId,
      totalItems: batchValidateDto.labelIds.length,
      processedItems: results.length,
      successCount,
      failureCount,
      results,
      startTime,
      endTime,
      duration,
    };

    this.logger.info(`Batch validation completed: ${batchId}`, {
      batchId,
      successCount,
      failureCount,
      duration,
    });

    return response;
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
