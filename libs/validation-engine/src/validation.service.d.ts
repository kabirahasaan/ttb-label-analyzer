import { LabelData, ApplicationData, ValidationResult, CrossCheckResult } from '@ttb/shared-types';
/**
 * Validation Service for NestJS
 */
export declare class ValidationService {
    private validationEngine;
    private crossCheckValidator;
    constructor();
    validateLabel(labelData: LabelData): ValidationResult;
    crossCheckLabelAndApplication(label: LabelData, application: ApplicationData): CrossCheckResult;
    validateLabelAndApplication(label: LabelData, application: ApplicationData): Promise<{
        validation: ValidationResult;
        crossCheck: CrossCheckResult;
    }>;
}
//# sourceMappingURL=validation.service.d.ts.map