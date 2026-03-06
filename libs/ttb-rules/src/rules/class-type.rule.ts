import { ValidationRule, ValidationRuleResult, ErrorSeverity } from '@ttb/shared-types';

export class ClassTypeRule implements ValidationRule {
  id = 'class-type-rule';
  name = 'Class and Type';
  description = 'Product class and type must be properly specified';
  category = 'mandatory';

  private validTypes = ['beer', 'wine', 'distilled spirit', 'mead', 'cider', 'sake'];

  applyRule(labelData: any): ValidationRuleResult {
    const classType = labelData.classType;
    const passed = classType && this.validTypes.includes(classType.toLowerCase());

    return {
      ruleId: this.id,
      ruleName: this.name,
      passed,
      severity: ErrorSeverity.ERROR,
      message: !passed ? `Class/type must be one of: ${this.validTypes.join(', ')}` : '',
    };
  }
}
