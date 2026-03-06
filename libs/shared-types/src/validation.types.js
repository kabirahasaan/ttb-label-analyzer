"use strict";
/**
 * Validation and compliance related types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceLevel = exports.ErrorSeverity = exports.ValidationStatus = void 0;
var ValidationStatus;
(function (ValidationStatus) {
    ValidationStatus["PENDING"] = "PENDING";
    ValidationStatus["PROCESSING"] = "PROCESSING";
    ValidationStatus["COMPLETED"] = "COMPLETED";
    ValidationStatus["FAILED"] = "FAILED";
})(ValidationStatus || (exports.ValidationStatus = ValidationStatus = {}));
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["INFO"] = "INFO";
    ErrorSeverity["WARNING"] = "WARNING";
    ErrorSeverity["ERROR"] = "ERROR";
    ErrorSeverity["CRITICAL"] = "CRITICAL";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
var ComplianceLevel;
(function (ComplianceLevel) {
    ComplianceLevel["COMPLIANT"] = "COMPLIANT";
    ComplianceLevel["WARNING"] = "WARNING";
    ComplianceLevel["NON_COMPLIANT"] = "NON_COMPLIANT";
})(ComplianceLevel || (exports.ComplianceLevel = ComplianceLevel = {}));
//# sourceMappingURL=validation.types.js.map