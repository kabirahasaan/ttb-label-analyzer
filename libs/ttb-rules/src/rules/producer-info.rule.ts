import { ValidationRule, ValidationRuleResult, ErrorSeverity } from '@ttb/shared-types';

export class ProducerInfoRule implements ValidationRule {
  id = 'producer-info-rule';
  name = 'Producer/Importer Information';
  description = 'Producer or importer information must be clearly stated';
  category = 'mandatory';

  applyRule(labelData: any): ValidationRuleResult {
    const passed = labelData.producerName && labelData.producerName.trim().length > 0;

    return {
      ruleId: this.id,
      ruleName: this.name,
      passed,
      severity: ErrorSeverity.ERROR,
      message: !passed ? 'Producer/importer information is required' : '',
      suggestion: !passed ? 'Add producer or importer name and address' : undefined,
    };
  }
}
