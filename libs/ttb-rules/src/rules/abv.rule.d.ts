import { ValidationRule, ValidationRuleResult } from '@ttb/shared-types';
export declare class ABVRule implements ValidationRule {
    id: string;
    name: string;
    description: string;
    category: string;
    applyRule(labelData: any): ValidationRuleResult;
}
//# sourceMappingURL=abv.rule.d.ts.map