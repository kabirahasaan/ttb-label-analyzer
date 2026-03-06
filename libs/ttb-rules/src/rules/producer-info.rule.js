"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProducerInfoRule = void 0;
const shared_types_1 = require("../../../shared-types/src/index.ts");
class ProducerInfoRule {
    constructor() {
        this.id = 'producer-info-rule';
        this.name = 'Producer/Importer Information';
        this.description = 'Producer or importer information must be clearly stated';
        this.category = 'mandatory';
    }
    applyRule(labelData) {
        const passed = labelData.producerName && labelData.producerName.trim().length > 0;
        return {
            ruleId: this.id,
            ruleName: this.name,
            passed,
            severity: shared_types_1.ErrorSeverity.ERROR,
            message: !passed ? 'Producer/importer information is required' : '',
            suggestion: !passed ? 'Add producer or importer name and address' : undefined,
        };
    }
}
exports.ProducerInfoRule = ProducerInfoRule;
//# sourceMappingURL=producer-info.rule.js.map