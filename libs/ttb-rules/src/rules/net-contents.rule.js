"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetContentsRule = void 0;
const shared_types_1 = require("../../../shared-types/src/index.ts");
class NetContentsRule {
    constructor() {
        this.id = 'net-contents-rule';
        this.name = 'Net Contents';
        this.description = 'Net contents must be clearly displayed';
        this.category = 'mandatory';
    }
    applyRule(labelData) {
        const passed = labelData.netContents && labelData.netContents.trim().length > 0;
        return {
            ruleId: this.id,
            ruleName: this.name,
            passed,
            severity: shared_types_1.ErrorSeverity.ERROR,
            message: !passed ? 'Net contents must be specified' : '',
            suggestion: !passed ? 'Add net contents (e.g., 750 mL, 12 fl oz)' : undefined,
        };
    }
}
exports.NetContentsRule = NetContentsRule;
//# sourceMappingURL=net-contents.rule.js.map