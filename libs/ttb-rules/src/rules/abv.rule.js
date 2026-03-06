"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ABVRule = void 0;
const shared_types_1 = require("../../../shared-types/src/index.ts");
class ABVRule {
    constructor() {
        this.id = 'abv-rule';
        this.name = 'Alcohol by Volume (ABV)';
        this.description = 'ABV must be displayed and must be between 0 and 100';
        this.category = 'mandatory';
    }
    applyRule(labelData) {
        const abv = labelData.alcoholByVolume;
        const passed = abv !== undefined && abv !== null && abv >= 0 && abv <= 100;
        return {
            ruleId: this.id,
            ruleName: this.name,
            passed,
            severity: shared_types_1.ErrorSeverity.ERROR,
            message: !passed ? 'ABV must be between 0 and 100 percent' : '',
            suggestion: !passed ? 'Verify ABV value on the label' : undefined,
        };
    }
}
exports.ABVRule = ABVRule;
//# sourceMappingURL=abv.rule.js.map