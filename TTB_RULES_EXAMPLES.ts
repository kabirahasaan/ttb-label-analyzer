/**
 * TTB Rules - Usage Examples
 *
 * Real-world examples of loading and using TTB rules in validation
 */

// ============================================================================
// EXAMPLE 1: Basic Rule Loading
// ============================================================================

import { TTBRulesStorage } from '@ttb/ttb-rules';

// Initialize storage
const storage = new TTBRulesStorage('libs/ttb-rules/data/rules');

// Load all rules
const allRules = storage.loadAllRules();
console.log(`Total rules: ${allRules.length}`);

// Load rules by category
const required = storage.loadRulesByCategory('required');
console.log(`Required rules: ${required.length}`);

const conditional = storage.loadRulesByCategory('conditional');
const prohibited = storage.loadRulesByCategory('prohibited');

// ============================================================================
// EXAMPLE 2: Load Rules by Beverage Type
// ============================================================================

// Get all rules applicable to beer
const beerRules = storage.loadRulesByBeverageType('beer');
console.log(`Beer requires ${beerRules.length} rules`);

// Get wine rules
const wineRules = storage.loadRulesByBeverageType('wine');
console.log(`Wine requires ${wineRules.length} rules`);

// Get spirits rules
const spiritsRules = storage.loadRulesByBeverageType('spirits');

// ============================================================================
// EXAMPLE 3: Search for Specific Rules
// ============================================================================

// Find all rules about "brand"
const brandRules = storage.searchRules('brand');
brandRules.forEach((rule) => {
  console.log(`- ${rule.name}: ${rule.description}`);
});

// Find rules about "health"
const healthRules = storage.searchRules('health');

// Find rules about "warning"
const warningRules = storage.searchRules('warning');

// ============================================================================
// EXAMPLE 4: Get Individual Rule Details
// ============================================================================

// Get specific rule by ID
const brandNameRule = storage.loadRuleById('brand-name-required');

if (brandNameRule) {
  console.log(`Rule ID: ${brandNameRule.id}`);
  console.log(`Name: ${brandNameRule.name}`);
  console.log(`Category: ${brandNameRule.category}`);
  console.log(`Description: ${brandNameRule.description}`);
  console.log(`CFR Reference: ${brandNameRule.cfr}`);
  console.log(`Applicable to: ${brandNameRule.applicableTo.join(', ')}`);
  console.log(`Requirements:`);
  brandNameRule.requirements.forEach((req, i) => {
    console.log(`  ${i + 1}. ${req}`);
  });
  console.log(`Source: ${brandNameRule.source.url}`);
}

// ============================================================================
// EXAMPLE 5: Get Statistics
// ============================================================================

const stats = storage.getStatistics();

console.log(`\n===== TTB RULES STATISTICS =====`);
console.log(`Total Rules: ${stats.totalRules}`);
console.log(`\nBy Category:`);
Object.entries(stats.byCategory).forEach(([category, count]) => {
  console.log(`  ${category}: ${count}`);
});

console.log(`\nBy Beverage Type:`);
Object.entries(stats.byBeverageType).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});

console.log(`\nLast Updated: ${stats.lastUpdated}`);

// ============================================================================
// EXAMPLE 6: Validate Label Against Rules
// ============================================================================

interface LabelData {
  brandName: string;
  alcoholByVolume: number;
  netContents: string;
  governmentWarning: string;
  classType: string;
  producerName: string;
}

function validateLabelAgainstRules(label: LabelData, beverageType: string): ValidationResult {
  // Get applicable rules
  const rules = storage.loadRulesByBeverageType(beverageType);

  const errors: string[] = [];
  const warnings: string[] = [];
  const passed: string[] = [];

  // Apply each rule
  for (const rule of rules) {
    const result = applyRule(rule, label);

    if (result.passed) {
      passed.push(rule.id);
    } else {
      if (rule.category === 'required') {
        errors.push(`[REQUIRED] ${rule.name}: ${result.message}`);
      } else if (rule.category === 'conditional') {
        warnings.push(`[CONDITIONAL] ${rule.name}: ${result.message}`);
      } else if (rule.category === 'prohibited') {
        errors.push(`[PROHIBITED] ${rule.name}: ${result.message}`);
      }
    }
  }

  return {
    isCompliant: errors.length === 0,
    errors,
    warnings,
    passedRules: passed.length,
    totalRules: rules.length,
    compliancePercentage: Math.round((passed.length / rules.length) * 100),
  };
}

// Apply individual rule
function applyRule(rule: any, label: LabelData): RuleCheckResult {
  switch (rule.id) {
    case 'brand-name-required':
      return {
        passed: !!label.brandName && label.brandName.length > 0,
        message: 'Brand name must be present and non-empty',
      };

    case 'abv-statement-required':
      return {
        passed:
          label.alcoholByVolume !== undefined &&
          label.alcoholByVolume >= 0 &&
          label.alcoholByVolume <= 100,
        message: 'ABV must be stated and be between 0-100%',
      };

    case 'health-warning-required':
      return {
        passed: !!label.governmentWarning && label.governmentWarning.length > 0,
        message: 'Government health warning statement is required',
      };

    case 'net-contents-required':
      return {
        passed: !!label.netContents && label.netContents.length > 0,
        message: 'Net contents must be declared on label',
      };

    default:
      return { passed: true, message: '' };
  }
}

// Example usage
const exampleLabel: LabelData = {
  brandName: 'Premium Ale',
  alcoholByVolume: 5.5,
  netContents: '12 fl oz (355 mL)',
  governmentWarning: 'GOVERNMENT WARNING: ...',
  classType: 'beer',
  producerName: 'Brewery Inc',
};

const result = validateLabelAgainstRules(exampleLabel, 'beer');

console.log(`\n===== VALIDATION RESULT =====`);
console.log(`Compliant: ${result.isCompliant ? '✓ YES' : '✗ NO'}`);
console.log(
  `Compliance: ${result.passedRules}/${result.totalRules} (${result.compliancePercentage}%)`
);

if (result.errors.length > 0) {
  console.log(`\nErrors (${result.errors.length}):`);
  result.errors.forEach((error) => console.log(`  ✗ ${error}`));
}

if (result.warnings.length > 0) {
  console.log(`\nWarnings (${result.warnings.length}):`);
  result.warnings.forEach((warning) => console.log(`  ⚠ ${warning}`));
}

// ============================================================================
// EXAMPLE 7: Create Compliance Checklist
// ============================================================================

function createComplianceChecklist(beverageType: string): ChecklistItem[] {
  const rules = storage.loadRulesByBeverageType(beverageType);

  return rules
    .filter((rule) => rule.category === 'required')
    .map((rule) => ({
      id: rule.id,
      name: rule.name,
      category: rule.category,
      requirements: rule.requirements,
      cfrReference: rule.cfr,
      completed: false,
    }));
}

// Generate beer checklist
const beerChecklist = createComplianceChecklist('beer');
console.log(`\nBeer Label Compliance Checklist:`);
beerChecklist.forEach((item, i) => {
  console.log(`${i + 1}. ${'☐'} ${item.name}`);
  item.requirements.forEach((req) => console.log(`   - ${req}`));
});

// ============================================================================
// EXAMPLE 8: Export Rules for Audit
// ============================================================================

// Export as CSV
const csv = storage.exportToCSV();
// console.log(csv);

// Export as JSON
const json = storage.exportToJSON();
// const parsed = JSON.parse(json);

// ============================================================================
// EXAMPLE 9: Use in NestJS Service
// ============================================================================

import { Injectable } from '@nestjs/common';

@Injectable()
export class LabelValidationService {
  private storage: TTBRulesStorage;

  constructor() {
    this.storage = new TTBRulesStorage('libs/ttb-rules/data/rules');
  }

  /**
   * Validate label against TTB rules
   */
  validateLabel(label: LabelData, beverageType: string) {
    const rules = this.storage.loadRulesByBeverageType(beverageType);

    const validation = {
      label,
      beverageType,
      appliedRules: rules.length,
      ruleResults: [] as any[],
    };

    for (const rule of rules) {
      const passed = this.checkRule(rule, label);
      validation.ruleResults.push({
        ruleId: rule.id,
        ruleName: rule.name,
        category: rule.category,
        passed,
        message: passed ? 'OK' : `Failed: ${rule.name}`,
      });
    }

    const failedRules = validation.ruleResults.filter((r) => !r.passed);

    return {
      ...validation,
      isCompliant: failedRules.length === 0,
      failedRules: failedRules.length,
      complianceScore: Math.round(((rules.length - failedRules.length) / rules.length) * 100),
    };
  }

  private checkRule(rule: any, label: LabelData): boolean {
    // Implement rule logic
    switch (rule.id) {
      case 'brand-name-required':
        return !!label.brandName;
      case 'abv-statement-required':
        return (
          label.alcoholByVolume !== undefined &&
          label.alcoholByVolume >= 0 &&
          label.alcoholByVolume <= 100
        );
      // ... more rules
      default:
        return true;
    }
  }
}

// ============================================================================
// EXAMPLE 10: Use in React Component
// ============================================================================

/*
import React, { useEffect, useState } from 'react';

export function RulesList({ beverageType }: { beverageType: string }) {
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    const storage = new TTBRulesStorage();
    const typeRules = storage.loadRulesByBeverageType(beverageType);
    setRules(typeRules);
  }, [beverageType]);

  return (
    <div className="space-y-4">
      <h2>TTB Rules for {beverageType}</h2>

      {/* Required rules * /}
      <section>
        <h3>Required ✓</h3>
        {rules
          .filter((r) => r.category === 'required')
          .map((rule) => (
            <div key={rule.id} className="border p-3 rounded">
              <h4>{rule.name}</h4>
              <p>{rule.description}</p>
              <ul>
                {rule.requirements.map((req, i) => (
                  <li key={i}>• {req}</li>
                ))}
              </ul>
            </div>
          ))}
      </section>

      {/* Conditional rules * /}
      <section>
        <h3>Conditional ⚠</h3>
        {rules
          .filter((r) => r.category === 'conditional')
          .map((rule) => (
            <div key={rule.id} className="border p-3 rounded">
              <h4>{rule.name}</h4>
              <p>{rule.description}</p>
            </div>
          ))}
      </section>
    </div>
  );
}
*/

// ============================================================================
// TYPES
// ============================================================================

interface RuleCheckResult {
  passed: boolean;
  message: string;
}

interface ValidationResult {
  isCompliant: boolean;
  errors: string[];
  warnings: string[];
  passedRules: number;
  totalRules: number;
  compliancePercentage: number;
}

interface ChecklistItem {
  id: string;
  name: string;
  category: string;
  requirements: string[];
  cfrReference: string;
  completed: boolean;
}

// ============================================================================
// SUMMARY
// ============================================================================

/*
COMMON USAGE PATTERNS:

1. Load all rules:
   storage.loadAllRules()

2. Get rules for beverage type:
   storage.loadRulesByBeverageType('beer')

3. Get rules by category:
   storage.loadRulesByCategory('required')

4. Search rules:
   storage.searchRules('brand')

5. Get single rule:
   storage.loadRuleById('brand-name-required')

6. Get statistics:
   storage.getStatistics()

7. Validate label:
   - Load applicable rules
   - Check each rule against label
   - Collect errors and warnings

8. Export:
   storage.exportToCSV()
   storage.exportToJSON()

See full documentation in:
- libs/ttb-rules/README.md
- TTB_RULES_QUICK_START.md
- TTB_RULES_INTEGRATION.md
*/
