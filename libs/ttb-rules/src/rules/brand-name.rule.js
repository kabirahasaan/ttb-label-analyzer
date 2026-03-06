"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandNameRule = void 0;
const shared_types_1 = require("../../../shared-types/src/index.ts");
class BrandNameRule {
    constructor() {
        this.id = 'brand-name-rule';
        this.name = 'Brand Name Required';
        this.description = 'Brand name must be prominently displayed on the label';
        this.category = 'mandatory';
    }
    applyRule(labelData) {
        const passed = labelData.brandName && labelData.brandName.trim().length > 0;
        return {
            ruleId: this.id,
            ruleName: this.name,
            passed,
            severity: shared_types_1.ErrorSeverity.ERROR,
            message: passed ? '' : 'Brand name is required and must be prominently displayed',
            suggestion: !passed ? 'Add brand name to the label' : undefined,
        };
    }
}
exports.BrandNameRule = BrandNameRule;
//# sourceMappingURL=brand-name.rule.js.map