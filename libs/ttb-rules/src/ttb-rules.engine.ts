import { ValidationRule, ValidationRuleResult, ErrorSeverity, LabelData } from '@ttb/shared-types';
import { TTBRulesStorage } from './fetcher/ttb-storage';
import * as path from 'path';

/**
 * TTB Rules Engine
 * Orchestrates multiple validation rules
 * Supports both static rules and dynamic loading from TTB sources
 */
export class TTBRulesEngine {
  private rules: ValidationRule[] = [];
  private ttbRulesStorage?: TTBRulesStorage;
  private dynamicRulesLoaded = false;

  constructor(storageDir?: string) {
    this.loadDefaultRules();

    // Initialize storage for dynamic rules if provided
    if (storageDir) {
      this.ttbRulesStorage = new TTBRulesStorage(storageDir);
    }
  }

  private loadDefaultRules(): void {
    // Rules will be loaded dynamically or used as fallback
  }

  /**
   * Load dynamic rules from TTB storage
   */
  loadDynamicRules(beverageType?: string): ParsedTTBRule[] {
    if (!this.ttbRulesStorage) {
      console.warn('TTB Rules Storage not initialized');
      return [];
    }

    try {
      let rules: ParsedTTBRule[];

      if (beverageType) {
        rules = this.ttbRulesStorage.loadRulesByBeverageType(beverageType);
      } else {
        rules = this.ttbRulesStorage.loadAllRules();
      }

      this.dynamicRulesLoaded = true;
      console.log(`✓ Loaded ${rules.length} dynamic TTB rules`);
      return rules;
    } catch (error) {
      console.error('Failed to load dynamic rules:', error);
      return [];
    }
  }

  /**
   * Search rules by keyword
   */
  searchRules(keyword: string): ParsedTTBRule[] {
    if (!this.ttbRulesStorage) {
      return [];
    }

    return this.ttbRulesStorage.searchRules(keyword);
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId: string): ParsedTTBRule | undefined {
    if (!this.ttbRulesStorage) {
      return undefined;
    }

    return this.ttbRulesStorage.loadRuleById(ruleId);
  }

  /**
   * Get rules statistics
   */
  getRulesStatistics(): any {
    if (!this.ttbRulesStorage) {
      return null;
    }

    return this.ttbRulesStorage.getStatistics();
  }

  /**
   * Check if dynamic rules are loaded
   */
  hasDynamicRules(): boolean {
    return this.dynamicRulesLoaded;
  }

  registerRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  validateLabel(labelData: LabelData): ValidationRuleResult[] {
    return this.rules.map((rule) => rule.applyRule(labelData));
  }

  // Specific validation methods
  validateBrandName(brandName: string | undefined): ValidationRuleResult {
    return {
      ruleId: 'brand-name',
      ruleName: 'Brand Name Required',
      passed: !!brandName && brandName.trim().length > 0,
      severity: ErrorSeverity.ERROR,
      message: brandName ? '' : 'Brand name is required on the label',
    };
  }

  validateABV(abv: number | undefined): ValidationRuleResult {
    const passed = abv !== undefined && abv >= 0 && abv <= 100;
    return {
      ruleId: 'abv',
      ruleName: 'Alcohol by Volume (ABV)',
      passed,
      severity: ErrorSeverity.ERROR,
      message: !passed ? 'ABV must be between 0 and 100' : '',
      suggestion: !passed ? 'Verify ABV value on the label' : undefined,
    };
  }

  validateNetContents(netContents: string | undefined): ValidationRuleResult {
    const passed = !!netContents && netContents.trim().length > 0;
    return {
      ruleId: 'net-contents',
      ruleName: 'Net Contents Required',
      passed,
      severity: ErrorSeverity.ERROR,
      message: !passed ? 'Net contents must be specified' : '',
      suggestion: !passed ? 'Add net contents (e.g., 750 mL)' : undefined,
    };
  }

  validateGovernmentWarning(warning: string | undefined): ValidationRuleResult {
    const passed = !!warning && warning.trim().length > 0;
    return {
      ruleId: 'government-warning',
      ruleName: 'Government Warning Label',
      passed,
      severity: ErrorSeverity.ERROR,
      message: !passed ? 'Government warning statement is required' : '',
    };
  }

  validateClassType(classType: string | undefined): ValidationRuleResult {
    const validTypes = ['beer', 'wine', 'distilled spirit', 'mead', 'cider'];
    const passed = !!classType && validTypes.includes(classType.toLowerCase());
    return {
      ruleId: 'class-type',
      ruleName: 'Class and Type',
      passed,
      severity: ErrorSeverity.ERROR,
      message: !passed ? `Class/type must be one of: ${validTypes.join(', ')}` : '',
    };
  }

  validateProducerInfo(producerName: string | undefined): ValidationRuleResult {
    const passed = !!producerName && producerName.trim().length > 0;
    return {
      ruleId: 'producer-info',
      ruleName: 'Producer Information',
      passed,
      severity: ErrorSeverity.ERROR,
      message: !passed ? 'Producer/importer information is required' : '',
    };
  }

  // Comprehensive validation
  validateAllRules(labelData: LabelData): ValidationRuleResult[] {
    return [
      this.validateBrandName(labelData.brandName),
      this.validateABV(labelData.alcoholByVolume),
      this.validateNetContents(labelData.netContents),
      this.validateGovernmentWarning(labelData.governmentWarning),
      this.validateClassType(labelData.classType),
      this.validateProducerInfo(labelData.producerName),
    ];
  }
}

// Import type (avoid circular dependency)
interface ParsedTTBRule {
  id: string;
  name: string;
  category: 'required' | 'conditional' | 'prohibited' | 'warning';
  description: string;
  requirements: string[];
  applicableTo: string[];
  source: any;
  cfr?: string;
  lastUpdated: string;
}
