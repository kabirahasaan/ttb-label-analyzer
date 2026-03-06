"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationEngine = void 0;
const shared_types_1 = require("../../shared-types/src/index.ts");
const ttb_rules_1 = require("../../ttb-rules/src/index.ts");
/**
 * Validation Engine
 * Orchestrates validation of labels against TTB rules
 */
class ValidationEngine {
    constructor() {
        this.rulesEngine = new ttb_rules_1.TTBRulesEngine();
    }
    validateLabel(labelData) {
        const ruleResults = this.rulesEngine.validateAllRules(labelData);
        const errors = [];
        const warnings = [];
        ruleResults.forEach((ruleResult) => {
            if (!ruleResult.passed) {
                const error = {
                    errorCode: ruleResult.ruleId,
                    errorMessage: ruleResult.message || '',
                    severity: ruleResult.severity,
                    suggestedFix: ruleResult.suggestion,
                };
                if (ruleResult.severity === shared_types_1.ErrorSeverity.ERROR) {
                    errors.push(error);
                }
                else if (ruleResult.severity === shared_types_1.ErrorSeverity.WARNING) {
                    warnings.push(error);
                }
            }
        });
        const isCompliant = errors.length === 0;
        const complianceLevel = this.determineComplianceLevel(isCompliant, warnings.length);
        return {
            labelId: labelData.id || 'unknown',
            status: shared_types_1.ValidationStatus.COMPLETED,
            isCompliant,
            complianceLevel,
            ttbValidationResult: this.generateTTBValidationResult(labelData),
            errors,
            warnings,
        };
    }
    generateTTBValidationResult(labelData) {
        return {
            brandNameValid: !!(labelData.brandName && labelData.brandName.trim()),
            abvValid: labelData.alcoholByVolume !== undefined,
            netContentsValid: !!(labelData.netContents && labelData.netContents.trim()),
            governmentWarningValid: !!(labelData.governmentWarning && labelData.governmentWarning.trim()),
            classTypeValid: !!(labelData.classType && labelData.classType.trim()),
            producerNameValid: !!(labelData.producerName && labelData.producerName.trim()),
            allFieldsPresent: !!(labelData.brandName && labelData.brandName.trim()) &&
                labelData.alcoholByVolume !== undefined &&
                !!(labelData.netContents && labelData.netContents.trim()) &&
                !!(labelData.governmentWarning && labelData.governmentWarning.trim()) &&
                !!(labelData.classType && labelData.classType.trim()) &&
                !!(labelData.producerName && labelData.producerName.trim()),
        };
    }
    determineComplianceLevel(isCompliant, warningCount) {
        if (isCompliant && warningCount === 0) {
            return shared_types_1.ComplianceLevel.COMPLIANT;
        }
        else if (isCompliant && warningCount > 0) {
            return shared_types_1.ComplianceLevel.WARNING;
        }
        else {
            return shared_types_1.ComplianceLevel.NON_COMPLIANT;
        }
    }
}
exports.ValidationEngine = ValidationEngine;
//# sourceMappingURL=validation.engine.js.map