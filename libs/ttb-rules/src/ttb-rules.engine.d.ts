import { ValidationRule, ValidationRuleResult, LabelData } from '@ttb/shared-types';
/**
 * TTB Rules Engine
 * Orchestrates multiple validation rules
 * Supports both static rules and dynamic loading from TTB sources
 */
export declare class TTBRulesEngine {
    private rules;
    private ttbRulesStorage?;
    private dynamicRulesLoaded;
    constructor(storageDir?: string);
    private loadDefaultRules;
    /**
     * Load dynamic rules from TTB storage
     */
    loadDynamicRules(beverageType?: string): ParsedTTBRule[];
    /**
     * Search rules by keyword
     */
    searchRules(keyword: string): ParsedTTBRule[];
    /**
     * Get rule by ID
     */
    getRule(ruleId: string): ParsedTTBRule | undefined;
    /**
     * Get rules statistics
     */
    getRulesStatistics(): any;
    /**
     * Check if dynamic rules are loaded
     */
    hasDynamicRules(): boolean;
    registerRule(rule: ValidationRule): void;
    validateLabel(labelData: LabelData): ValidationRuleResult[];
    validateBrandName(brandName: string | undefined): ValidationRuleResult;
    validateABV(abv: number | undefined): ValidationRuleResult;
    validateNetContents(netContents: string | undefined): ValidationRuleResult;
    validateGovernmentWarning(warning: string | undefined): ValidationRuleResult;
    validateClassType(classType: string | undefined): ValidationRuleResult;
    validateProducerInfo(producerName: string | undefined): ValidationRuleResult;
    validateAllRules(labelData: LabelData): ValidationRuleResult[];
}
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
export {};
//# sourceMappingURL=ttb-rules.engine.d.ts.map