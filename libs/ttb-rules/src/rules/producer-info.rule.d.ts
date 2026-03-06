import { ValidationRule, ValidationRuleResult } from '@ttb/shared-types';
export declare class ProducerInfoRule implements ValidationRule {
    id: string;
    name: string;
    description: string;
    category: string;
    applyRule(labelData: any): ValidationRuleResult;
}
//# sourceMappingURL=producer-info.rule.d.ts.map