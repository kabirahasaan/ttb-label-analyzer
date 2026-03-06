import { ValidationRule, ValidationRuleResult, ErrorSeverity } from '@ttb/shared-types';

export class NetContentsRule implements ValidationRule {
  id = 'net-contents-rule';
  name = 'Net Contents';
  description = 'Net contents must be clearly displayed';
  category = 'mandatory';

  applyRule(labelData: any): ValidationRuleResult {
    const passed = labelData.netContents && labelData.netContents.trim().length > 0;

    return {
      ruleId: this.id,
      ruleName: this.name,
      passed,
      severity: ErrorSeverity.ERROR,
      message: !passed ? 'Net contents must be specified' : '',
      suggestion: !passed ? 'Add net contents (e.g., 750 mL, 12 fl oz)' : undefined,
    };
  }
}
