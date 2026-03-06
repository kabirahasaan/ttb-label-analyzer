import {
  LabelData,
  ValidationResult,
  ValidationStatus,
  ComplianceLevel,
  ValidationError,
  ErrorSeverity,
  TTBValidationResult,
} from '@ttb/shared-types';
import { TTBRulesEngine } from '@ttb/ttb-rules';

/**
 * Validation Engine
 * Orchestrates validation of labels against TTB rules
 */
export class ValidationEngine {
  private rulesEngine: TTBRulesEngine;

  constructor() {
    this.rulesEngine = new TTBRulesEngine();
  }

  validateLabel(labelData: LabelData): ValidationResult {
    const ruleResults = this.rulesEngine.validateAllRules(labelData);

    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    ruleResults.forEach((ruleResult) => {
      if (!ruleResult.passed) {
        const error: ValidationError = {
          errorCode: ruleResult.ruleId,
          errorMessage: ruleResult.message || '',
          severity: ruleResult.severity,
          suggestedFix: ruleResult.suggestion,
        };

        if (ruleResult.severity === ErrorSeverity.ERROR) {
          errors.push(error);
        } else if (ruleResult.severity === ErrorSeverity.WARNING) {
          warnings.push(error);
        }
      }
    });

    const isCompliant = errors.length === 0;
    const complianceLevel = this.determineComplianceLevel(isCompliant, warnings.length);

    return {
      labelId: labelData.id || 'unknown',
      status: ValidationStatus.COMPLETED,
      isCompliant,
      complianceLevel,
      ttbValidationResult: this.generateTTBValidationResult(labelData),
      errors,
      warnings,
    };
  }

  private generateTTBValidationResult(labelData: LabelData): TTBValidationResult {
    return {
      brandNameValid: !!(labelData.brandName && labelData.brandName.trim()),
      abvValid: labelData.alcoholByVolume !== undefined,
      netContentsValid: !!(labelData.netContents && labelData.netContents.trim()),
      governmentWarningValid: !!(labelData.governmentWarning && labelData.governmentWarning.trim()),
      classTypeValid: !!(labelData.classType && labelData.classType.trim()),
      producerNameValid: !!(labelData.producerName && labelData.producerName.trim()),
      allFieldsPresent:
        !!(labelData.brandName && labelData.brandName.trim()) &&
        labelData.alcoholByVolume !== undefined &&
        !!(labelData.netContents && labelData.netContents.trim()) &&
        !!(labelData.governmentWarning && labelData.governmentWarning.trim()) &&
        !!(labelData.classType && labelData.classType.trim()) &&
        !!(labelData.producerName && labelData.producerName.trim()),
    };
  }

  private determineComplianceLevel(isCompliant: boolean, warningCount: number): ComplianceLevel {
    if (isCompliant && warningCount === 0) {
      return ComplianceLevel.COMPLIANT;
    } else if (isCompliant && warningCount > 0) {
      return ComplianceLevel.WARNING;
    } else {
      return ComplianceLevel.NON_COMPLIANT;
    }
  }
}
