import { Injectable } from '@nestjs/common';
import { ValidationEngine } from './validation.engine';
import { CrossCheckValidator } from './cross-check.validator';
import { LabelData, ApplicationData, ValidationResult, CrossCheckResult } from '@ttb/shared-types';

/**
 * Validation Service for NestJS
 */
@Injectable()
export class ValidationService {
  private validationEngine: ValidationEngine;
  private crossCheckValidator: CrossCheckValidator;

  constructor() {
    this.validationEngine = new ValidationEngine();
    this.crossCheckValidator = new CrossCheckValidator();
  }

  validateLabel(labelData: LabelData): ValidationResult {
    return this.validationEngine.validateLabel(labelData);
  }

  crossCheckLabelAndApplication(label: LabelData, application: ApplicationData): CrossCheckResult {
    return this.crossCheckValidator.validateLabelAgainstApplication(label, application);
  }

  async validateLabelAndApplication(
    label: LabelData,
    application: ApplicationData
  ): Promise<{ validation: ValidationResult; crossCheck: CrossCheckResult }> {
    const validation = this.validateLabel(label);
    const crossCheck = this.crossCheckLabelAndApplication(label, application);

    return { validation, crossCheck };
  }
}
