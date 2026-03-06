import { ValidationRule, ValidationRuleResult } from '@ttb/shared-types';
export declare class GovernmentWarningRule implements ValidationRule {
    id: string;
    name: string;
    description: string;
    category: string;
    private requiredWarningText;
    applyRule(labelData: any): ValidationRuleResult;
}
//# sourceMappingURL=government-warning.rule.d.ts.map