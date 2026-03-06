"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernmentWarningRule = void 0;
const shared_types_1 = require("../../../shared-types/src/index.ts");
class GovernmentWarningRule {
    constructor() {
        this.id = 'government-warning-rule';
        this.name = 'Government Warning Label';
        this.description = 'TTB mandated warning statement must be displayed on the label';
        this.category = 'mandatory';
        this.requiredWarningText = 'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects.';
    }
    applyRule(labelData) {
        const warning = labelData.governmentWarning;
        const passed = warning && warning.trim().length > 0;
        return {
            ruleId: this.id,
            ruleName: this.name,
            passed,
            severity: shared_types_1.ErrorSeverity.ERROR,
            message: !passed ? 'Government warning statement is required' : '',
            suggestion: !passed ? 'Add the mandatory TTB government warning' : undefined,
        };
    }
}
exports.GovernmentWarningRule = GovernmentWarningRule;
//# sourceMappingURL=government-warning.rule.js.map