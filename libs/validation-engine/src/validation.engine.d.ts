import { LabelData, ValidationResult } from '@ttb/shared-types';
/**
 * Validation Engine
 * Orchestrates validation of labels against TTB rules
 */
export declare class ValidationEngine {
    private rulesEngine;
    constructor();
    validateLabel(labelData: LabelData): ValidationResult;
    private generateTTBValidationResult;
    private determineComplianceLevel;
}
//# sourceMappingURL=validation.engine.d.ts.map