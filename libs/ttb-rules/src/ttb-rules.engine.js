"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTBRulesEngine = void 0;
const shared_types_1 = require("../../shared-types/src/index.ts");
const ttb_storage_1 = require("./fetcher/ttb-storage");
/**
 * TTB Rules Engine
 * Orchestrates multiple validation rules
 * Supports both static rules and dynamic loading from TTB sources
 */
class TTBRulesEngine {
    constructor(storageDir) {
        this.rules = [];
        this.dynamicRulesLoaded = false;
        this.loadDefaultRules();
        // Initialize storage for dynamic rules if provided
        if (storageDir) {
            this.ttbRulesStorage = new ttb_storage_1.TTBRulesStorage(storageDir);
        }
    }
    loadDefaultRules() {
        // Rules will be loaded dynamically or used as fallback
    }
    /**
     * Load dynamic rules from TTB storage
     */
    loadDynamicRules(beverageType) {
        if (!this.ttbRulesStorage) {
            console.warn('TTB Rules Storage not initialized');
            return [];
        }
        try {
            let rules;
            if (beverageType) {
                rules = this.ttbRulesStorage.loadRulesByBeverageType(beverageType);
            }
            else {
                rules = this.ttbRulesStorage.loadAllRules();
            }
            this.dynamicRulesLoaded = true;
            console.log(`✓ Loaded ${rules.length} dynamic TTB rules`);
            return rules;
        }
        catch (error) {
            console.error('Failed to load dynamic rules:', error);
            return [];
        }
    }
    /**
     * Search rules by keyword
     */
    searchRules(keyword) {
        if (!this.ttbRulesStorage) {
            return [];
        }
        return this.ttbRulesStorage.searchRules(keyword);
    }
    /**
     * Get rule by ID
     */
    getRule(ruleId) {
        if (!this.ttbRulesStorage) {
            return undefined;
        }
        return this.ttbRulesStorage.loadRuleById(ruleId);
    }
    /**
     * Get rules statistics
     */
    getRulesStatistics() {
        if (!this.ttbRulesStorage) {
            return null;
        }
        return this.ttbRulesStorage.getStatistics();
    }
    /**
     * Check if dynamic rules are loaded
     */
    hasDynamicRules() {
        return this.dynamicRulesLoaded;
    }
    registerRule(rule) {
        this.rules.push(rule);
    }
    validateLabel(labelData) {
        return this.rules.map((rule) => rule.applyRule(labelData));
    }
    // Specific validation methods
    validateBrandName(brandName) {
        return {
            ruleId: 'brand-name',
            ruleName: 'Brand Name Required',
            passed: !!brandName && brandName.trim().length > 0,
            severity: shared_types_1.ErrorSeverity.ERROR,
            message: brandName ? '' : 'Brand name is required on the label',
        };
    }
    validateABV(abv) {
        const passed = abv !== undefined && abv >= 0 && abv <= 100;
        return {
            ruleId: 'abv',
            ruleName: 'Alcohol by Volume (ABV)',
            passed,
            severity: shared_types_1.ErrorSeverity.ERROR,
            message: !passed ? 'ABV must be between 0 and 100' : '',
            suggestion: !passed ? 'Verify ABV value on the label' : undefined,
        };
    }
    validateNetContents(netContents) {
        const passed = !!netContents && netContents.trim().length > 0;
        return {
            ruleId: 'net-contents',
            ruleName: 'Net Contents Required',
            passed,
            severity: shared_types_1.ErrorSeverity.ERROR,
            message: !passed ? 'Net contents must be specified' : '',
            suggestion: !passed ? 'Add net contents (e.g., 750 mL)' : undefined,
        };
    }
    validateGovernmentWarning(warning) {
        const passed = !!warning && warning.trim().length > 0;
        return {
            ruleId: 'government-warning',
            ruleName: 'Government Warning Label',
            passed,
            severity: shared_types_1.ErrorSeverity.ERROR,
            message: !passed ? 'Government warning statement is required' : '',
        };
    }
    validateClassType(classType) {
        const validTypes = ['beer', 'wine', 'distilled spirit', 'mead', 'cider'];
        const passed = !!classType && validTypes.includes(classType.toLowerCase());
        return {
            ruleId: 'class-type',
            ruleName: 'Class and Type',
            passed,
            severity: shared_types_1.ErrorSeverity.ERROR,
            message: !passed ? `Class/type must be one of: ${validTypes.join(', ')}` : '',
        };
    }
    validateProducerInfo(producerName) {
        const passed = !!producerName && producerName.trim().length > 0;
        return {
            ruleId: 'producer-info',
            ruleName: 'Producer Information',
            passed,
            severity: shared_types_1.ErrorSeverity.ERROR,
            message: !passed ? 'Producer/importer information is required' : '',
        };
    }
    // Comprehensive validation
    validateAllRules(labelData) {
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
exports.TTBRulesEngine = TTBRulesEngine;
//# sourceMappingURL=ttb-rules.engine.js.map