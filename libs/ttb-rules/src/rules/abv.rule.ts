import { ValidationRule, ValidationRuleResult, ErrorSeverity } from '@ttb/shared-types';

export class ABVRule implements ValidationRule {
  id = 'abv-rule';
  name = 'Alcohol by Volume (ABV)';
  description = 'ABV must be displayed and must be between 0 and 100';
  category = 'mandatory';

  applyRule(labelData: any): ValidationRuleResult {
    const abv = labelData.alcoholByVolume;
    const passed = abv !== undefined && abv !== null && abv >= 0 && abv <= 100;

    return {
      ruleId: this.id,
      ruleName: this.name,
      passed,
      severity: ErrorSeverity.ERROR,
      message: !passed ? 'ABV must be between 0 and 100 percent' : '',
      suggestion: !passed ? 'Verify ABV value on the label' : undefined,
    };
  }
}
