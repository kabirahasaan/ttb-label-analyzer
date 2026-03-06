"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassTypeRule = void 0;
const shared_types_1 = require("../../../shared-types/src/index.ts");
class ClassTypeRule {
    constructor() {
        this.id = 'class-type-rule';
        this.name = 'Class and Type';
        this.description = 'Product class and type must be properly specified';
        this.category = 'mandatory';
        this.validTypes = ['beer', 'wine', 'distilled spirit', 'mead', 'cider', 'sake'];
    }
    applyRule(labelData) {
        const classType = labelData.classType;
        const passed = classType && this.validTypes.includes(classType.toLowerCase());
        return {
            ruleId: this.id,
            ruleName: this.name,
            passed,
            severity: shared_types_1.ErrorSeverity.ERROR,
            message: !passed ? `Class/type must be one of: ${this.validTypes.join(', ')}` : '',
        };
    }
}
exports.ClassTypeRule = ClassTypeRule;
//# sourceMappingURL=class-type.rule.js.map