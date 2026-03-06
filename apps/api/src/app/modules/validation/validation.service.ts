import { Injectable } from '@nestjs/common';
import { ValidationService } from '@ttb/validation-engine';
import { LabelService } from '../label/label.service';
import { ApplicationService } from '../application/application.service';
import { ValidationResult, CrossCheckResult } from '@ttb/shared-types';
import { LoggerService } from '@ttb/logger';

/**
 * Validation Controller Service
 * Orchestrates validation operations
 */
@Injectable()
export class ValidateService {
  private validationEngine: ValidationService;

  constructor(
    private labelService: LabelService,
    private applicationService: ApplicationService,
    private logger: LoggerService
  ) {
    this.validationEngine = new ValidationService();
  }

  validateLabel(labelId: string): ValidationResult {
    const label = this.labelService.findOne(labelId);
    const result = this.validationEngine.validateLabel(label);
    this.logger.info(`Label validated: ${labelId}`, {
      labelId,
      isCompliant: result.isCompliant,
    });
    return result;
  }

  crossCheckLabelAndApplication(labelId: string, applicationId: string): CrossCheckResult {
    const label = this.labelService.findOne(labelId);
    const application = this.applicationService.findOne(applicationId);

    const result = this.validationEngine.crossCheckLabelAndApplication(label, application);

    this.logger.info(`Cross-check completed: ${labelId} vs ${applicationId}`, {
      labelId,
      applicationId,
      match: result.match,
      matchPercentage: result.matchPercentage,
    });

    return result;
  }
}
