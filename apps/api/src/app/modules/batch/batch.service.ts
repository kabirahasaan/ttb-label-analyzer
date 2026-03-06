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
    const maxConcurrency = batchValidateDto.maxConcurrency ?? 10;

    this.logger.info(`Batch concurrency configured: ${maxConcurrency}`, {
      batchId,
      maxConcurrency,
    });

    const chunks = this.chunkArray(batchValidateDto.labelIds, maxConcurrency);

    for (const chunk of chunks) {
      const settled = await Promise.allSettled(
        chunk.map(async (labelId) => {
          const validationResult = this.validateService.validateLabel(labelId);
          return { labelId, validationResult };
        })
      );

      for (const item of settled) {
        if (item.status === 'fulfilled') {
          results.push(item.value.validationResult);
          successCount++;
        } else {
          this.logger.error('Failed to validate label in batch chunk', item.reason as Error);
          failureCount++;
        }
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

  private chunkArray<T>(items: T[], chunkSize: number): T[][] {
    const safeChunkSize = Math.max(1, chunkSize);
    const chunks: T[][] = [];

    for (let index = 0; index < items.length; index += safeChunkSize) {
      chunks.push(items.slice(index, index + safeChunkSize));
    }

    return chunks;
  }
}
