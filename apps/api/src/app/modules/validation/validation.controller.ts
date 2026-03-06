import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ValidateService } from './validation.service';
import { ValidateLabelDto, CrossCheckDto } from './validation.dto';
import { ValidationResult, CrossCheckResult } from '@ttb/shared-types';

@ApiTags('validation')
@Controller('validate')
export class ValidationController {
  constructor(private validateService: ValidateService) {}

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
