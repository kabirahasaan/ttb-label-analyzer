import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ValidateService } from './validation.service';
import {
  ValidateLabelDto,
  CrossCheckDto,
  StartValidationJobDto,
  ValidationJobStatusResponse,
} from './validation.dto';
import { ValidationResult, CrossCheckResult } from '@ttb/shared-types';

@ApiTags('validation')
@Controller('validate')
export class ValidationController {
  constructor(private validateService: ValidateService) {}

  @Post('progress/start')
  @ApiOperation({ summary: 'Start backend validation progress job' })
  @ApiResponse({ status: 201, description: 'Validation progress job started' })
  startProgress(@Body() payload: StartValidationJobDto): ValidationJobStatusResponse {
    return this.validateService.startValidationProgressJob(payload);
  }

  @Get('progress/:jobId')
  @ApiOperation({ summary: 'Get backend validation progress job status' })
  @ApiResponse({ status: 200, description: 'Validation progress job status' })
  getProgress(@Param('jobId') jobId: string): ValidationJobStatusResponse {
    return this.validateService.getValidationProgressJob(jobId);
  }

  @Post('label')
  @ApiOperation({ summary: 'Validate a label' })
  @ApiResponse({ status: 200, description: 'Validation result' })
  validateLabel(@Body() validateLabelDto: ValidateLabelDto): ValidationResult {
    return this.validateService.validateLabel(validateLabelDto.labelId);
  }

  @Post('cross-check')
  @ApiOperation({ summary: 'Cross-check label against application' })
  @ApiResponse({ status: 200, description: 'Cross-check result' })
  crossCheck(@Body() crossCheckDto: CrossCheckDto): CrossCheckResult {
    return this.validateService.crossCheckLabelAndApplication(
      crossCheckDto.labelId,
      crossCheckDto.applicationId
    );
  }
}
