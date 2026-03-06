import { LabelData, ApplicationData, CrossCheckResult } from '@ttb/shared-types';
/**
 * Cross-Check Validator
 * Validates consistency between label data and application data
 */
export declare class CrossCheckValidator {
    validateLabelAgainstApplication(label: LabelData, application: ApplicationData): CrossCheckResult;
    private findDiscrepancies;
    private valuesMatch;
    private numbersMatch;
    private calculateMatchPercentage;
}
//# sourceMappingURL=cross-check.validator.d.ts.map