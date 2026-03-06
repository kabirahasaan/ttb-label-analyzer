import { ValidationRule, ValidationRuleResult } from '@ttb/shared-types';
export declare class ClassTypeRule implements ValidationRule {
    id: string;
    name: string;
    description: string;
    category: string;
    private validTypes;
    applyRule(labelData: any): ValidationRuleResult;
}
//# sourceMappingURL=class-type.rule.d.ts.map