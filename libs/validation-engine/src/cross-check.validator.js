"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossCheckValidator = void 0;
const shared_types_1 = require("../../shared-types/src/index.ts");
/**
 * Cross-Check Validator
 * Validates consistency between label data and application data
 */
class CrossCheckValidator {
    validateLabelAgainstApplication(label, application) {
        const discrepancies = this.findDiscrepancies(label, application);
        const match = discrepancies.length === 0;
        const matchPercentage = this.calculateMatchPercentage(discrepancies);
        return {
            labelId: label.id || 'unknown',
            applicationId: application.id || 'unknown',
            match,
            discrepancies,
            matchPercentage,
        };
    }
    findDiscrepancies(label, application) {
        const discrepancies = [];
        // Brand name check
        if (!this.valuesMatch(label.brandName, application.brandName)) {
            discrepancies.push({
                field: 'brandName',
                labelValue: label.brandName,
                applicationValue: application.brandName,
                mismatch: true,
                severity: shared_types_1.ErrorSeverity.ERROR,
            });
        }
        // ABV check (with small tolerance for rounding)
        if (!this.numbersMatch(label.alcoholByVolume, application.alcoholByVolume, 0.1)) {
            discrepancies.push({
                field: 'alcoholByVolume',
                labelValue: label.alcoholByVolume,
                applicationValue: application.alcoholByVolume,
                mismatch: true,
                severity: shared_types_1.ErrorSeverity.ERROR,
            });
        }
        // Net contents check
        if (!this.valuesMatch(label.netContents, application.netContents)) {
            discrepancies.push({
                field: 'netContents',
                labelValue: label.netContents,
                applicationValue: application.netContents,
                mismatch: true,
                severity: shared_types_1.ErrorSeverity.WARNING,
            });
        }
        // Producer name check
        if (!this.valuesMatch(label.producerName, application.producerName)) {
            discrepancies.push({
                field: 'producerName',
                labelValue: label.producerName,
                applicationValue: application.producerName,
                mismatch: true,
                severity: shared_types_1.ErrorSeverity.WARNING,
            });
        }
        return discrepancies;
    }
    valuesMatch(value1, value2) {
        if (typeof value1 === 'string' && typeof value2 === 'string') {
            return value1.toLowerCase().trim() === value2.toLowerCase().trim();
        }
        return value1 === value2;
    }
    numbersMatch(num1, num2, tolerance = 0) {
        if (num1 === undefined || num2 === undefined) {
            return false;
        }
        return Math.abs(num1 - num2) <= tolerance;
    }
    calculateMatchPercentage(discrepancies) {
        const totalFields = 4; // brandName, ABV, netContents, producerName
        const matchedFields = totalFields - discrepancies.length;
        return Math.round((matchedFields / totalFields) * 100);
    }
}
exports.CrossCheckValidator = CrossCheckValidator;
//# sourceMappingURL=cross-check.validator.js.map