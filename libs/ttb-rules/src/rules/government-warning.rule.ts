import { ValidationRule, ValidationRuleResult, ErrorSeverity } from '@ttb/shared-types';

export class GovernmentWarningRule implements ValidationRule {
  id = 'government-warning-rule';
  name = 'Government Warning Label';
  description = 'TTB mandated warning statement must be displayed on the label';
  category = 'mandatory';

  private requiredWarningText =
    'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects.';

  applyRule(labelData: any): ValidationRuleResult {
    const warning = labelData.governmentWarning;
    const passed = warning && warning.trim().length > 0;

    return {
      ruleId: this.id,
      ruleName: this.name,
      passed,
      severity: ErrorSeverity.ERROR,
      message: !passed ? 'Government warning statement is required' : '',
      suggestion: !passed ? 'Add the mandatory TTB government warning' : undefined,
    };
  }
}
