import { ParsedTTBRule } from './ttb-parser';
/**
 * TTB Rules Storage
 * Manages persistent storage of parsed TTB rules in JSON format
 */
export declare class TTBRulesStorage {
    private rulesDir;
    constructor(rulesDir?: string);
    private ensureDirectoriesExist;
    /**
     * Save all rules to JSON files organized by category
     */
    saveRules(rules: ParsedTTBRule[]): void;
    /**
     * Load all rules from storage
     */
    loadAllRules(): ParsedTTBRule[];
    /**
     * Load rules by category
     */
    loadRulesByCategory(category: string): ParsedTTBRule[];
    /**
     * Load rules by beverage type
     */
    loadRulesByBeverageType(beverageType: string): ParsedTTBRule[];
    /**
     * Load rules by ID
     */
    loadRuleById(ruleId: string): ParsedTTBRule | undefined;
    /**
     * Load rules by IDs
     */
    loadRulesById(ruleIds: string[]): ParsedTTBRule[];
    /**
     * Search rules by keyword
     */
    searchRules(keyword: string): ParsedTTBRule[];
    /**
     * Get rules statistics
     */
    getStatistics(): {
        totalRules: number;
        byCategory: Record<string, number>;
        byBeverageType: Record<string, number>;
        lastUpdated: string;
    };
    /**
     * Export rules to CSV
     */
    exportToCSV(): string;
    /**
     * Export rules to JSON
     */
    exportToJSON(): string;
    /**
     * Clear all stored rules
     */
    clearRules(): void;
    /**
     * Get rules directory
     */
    getRulesDir(): string;
    /**
     * Organize rules by category
     */
    private organizeByCategory;
    /**
     * Save metadata about rules
     */
    private saveMetadata;
    /**
     * Load metadata
     */
    private loadMetadata;
    /**
     * Calculate statistics per beverage type
     */
    private calculateStatistics;
}
//# sourceMappingURL=ttb-storage.d.ts.map