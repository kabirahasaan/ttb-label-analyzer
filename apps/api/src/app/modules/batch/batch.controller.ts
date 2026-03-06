import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BatchService } from './batch.service';
import { BatchValidateDto } from './batch.dto';
import { BatchValidationResponse } from '@ttb/shared-types';

@ApiTags('batch')
@Controller('batch')
export class BatchController {
  constructor(private batchService: BatchService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Batch validate labels' })
  @ApiResponse({ status: 200, description: 'Batch validation result' })
  validate(@Body() batchValidateDto: BatchValidateDto): Promise<BatchValidationResponse> {
    return this.batchService.validateBatch(batchValidateDto);
  }
}
