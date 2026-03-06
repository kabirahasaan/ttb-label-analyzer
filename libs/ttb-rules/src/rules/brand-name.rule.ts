import { ValidationRule, ValidationRuleResult, ErrorSeverity } from '@ttb/shared-types';

export class BrandNameRule implements ValidationRule {
  id = 'brand-name-rule';
  name = 'Brand Name Required';
  description = 'Brand name must be prominently displayed on the label';
  category = 'mandatory';

  applyRule(labelData: any): ValidationRuleResult {
    const passed = labelData.brandName && labelData.brandName.trim().length > 0;
    return {
      ruleId: this.id,
      ruleName: this.name,
      passed,
      severity: ErrorSeverity.ERROR,
      message: passed ? '' : 'Brand name is required and must be prominently displayed',
      suggestion: !passed ? 'Add brand name to the label' : undefined,
    };
  }
}
