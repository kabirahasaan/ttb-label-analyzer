import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ValidateService } from './validation.service';
import {
  ValidateLabelDto,
  CrossCheckDto,
  StartValidationJobDto,
  ValidationJobStatusResponse,
  SaveValidationResultDto,
  StoredValidationResult,
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

  @Post('results')
  @ApiOperation({ summary: 'Save validation result' })
  @ApiResponse({ status: 201, description: 'Validation result saved' })
  saveResult(@Body() payload: SaveValidationResultDto): StoredValidationResult {
    return this.validateService.saveValidationResult(payload);
  }

  @Get('results')
  @ApiOperation({ summary: 'Get all validation results' })
  @ApiResponse({ status: 200, description: 'List of validation results' })
  getAllResults(): StoredValidationResult[] {
    return this.validateService.getAllValidationResults();
  }

  @Get('results/:id')
  @ApiOperation({ summary: 'Get validation result by ID' })
  @ApiResponse({ status: 200, description: 'Validation result details' })
  getResult(@Param('id') id: string): StoredValidationResult | null {
    return this.validateService.getValidationResult(id);
  }
}
