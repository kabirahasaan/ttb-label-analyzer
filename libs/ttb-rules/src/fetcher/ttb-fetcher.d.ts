/**
 * TTB Fetcher
 * Fetches official TTB labeling requirements from https://www.ttb.gov
 */
export interface FetchOptions {
    cacheDir?: string;
    timeout?: number;
    retries?: number;
}
export interface TTBRuleDocument {
    url: string;
    title: string;
    content: string;
    fetchedAt: string;
    source: 'ttb.gov';
}
export declare class TTBFetcher {
    private axiosInstance;
    private cacheDir;
    private retries;
    constructor(options?: FetchOptions);
    private ensureCacheDir;
    /**
     * Main TTB labeling requirements document
     * CFR 27 Part 4-5 (Alcohol Beverage Labeling)
     */
    fetchBeerWineSpiritsLabelingGuide(): Promise<TTBRuleDocument>;
    /**
     * Beer labeling standards (CFR 27 Part 7)
     */
    fetchBeerLabelingStandards(): Promise<TTBRuleDocument>;
    /**
     * Wine labeling standards (CFR 27 Part 4)
     */
    fetchWineLabelingStandards(): Promise<TTBRuleDocument>;
    /**
     * Distilled spirits labeling standards (CFR 27 Part 5)
     */
    fetchSpiritLabelingStandards(): Promise<TTBRuleDocument>;
    /**
     * Health warning statements
     */
    fetchHealthWarningRequirements(): Promise<TTBRuleDocument>;
    /**
     * Sulfite disclosure requirements
     */
    fetchSulfiteDisclosureRules(): Promise<TTBRuleDocument>;
    /**
     * Net contents declaration rules
     */
    fetchNetContentsRules(): Promise<TTBRuleDocument>;
    /**
     * Country of origin requirements
     */
    fetchCountryOfOriginRules(): Promise<TTBRuleDocument>;
    /**
     * Prohibited statements and claims
     */
    fetchProhibitedStatementsRules(): Promise<TTBRuleDocument>;
    /**
     * Fetch and cache document from URL with retries
     */
    private fetchAndCache;
    /**
     * Extract title from URL
     */
    private extractTitle;
    /**
     * Fetch all documents
     */
    fetchAllDocuments(): Promise<TTBRuleDocument[]>;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Get cache directory
     */
    getCacheDir(): string;
}
//# sourceMappingURL=ttb-fetcher.d.ts.map