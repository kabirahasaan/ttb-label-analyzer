import { TTBRuleDocument } from './ttb-fetcher';
/**
 * Parsed TTB Rule
 */
export interface ParsedTTBRule {
    id: string;
    name: string;
    category: 'required' | 'conditional' | 'prohibited' | 'warning';
    description: string;
    requirements: string[];
    applicableTo: string[];
    source: TTBRuleSource;
    cfr?: string;
    lastUpdated: string;
}
/**
 * TTB Rule Source
 */
export interface TTBRuleSource {
    document: string;
    url: string;
    section?: string;
    quotation?: string;
}
/**
 * TTB Rules Parser
 * Extracts structured rules from TTB documents
 */
export declare class TTBRulesParser {
    /**
     * Parse fetched documents into structured rules
     */
    parseDocuments(documents: TTBRuleDocument[]): ParsedTTBRule[];
    /**
     * Parse brand name rules
     */
    private parseBrandNameRules;
    /**
     * Parse ABV rules
     */
    private parseABVRules;
    /**
     * Parse health warning rules
     */
    private parseHealthWarningRules;
    /**
     * Parse net contents rules
     */
    private parseNetContentsRules;
    /**
     * Parse country of origin rules
     */
    private parseCountryOfOriginRules;
    /**
     * Parse sulfite rules
     */
    private parseSulfiteRules;
    /**
     * Parse prohibited statements rules
     */
    private parseProhibitedStatementsRules;
    /**
     * Parse beer-specific rules
     */
    private parseBeerSpecificRules;
    /**
     * Parse wine-specific rules
     */
    private parseWineSpecificRules;
    /**
     * Parse distilled spirits-specific rules
     */
    private parseSpiritSpecificRules;
}
//# sourceMappingURL=ttb-parser.d.ts.map