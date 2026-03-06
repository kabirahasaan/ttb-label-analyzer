"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTBFetcher = void 0;
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class TTBFetcher {
    constructor(options = {}) {
        this.retries = 3;
        this.cacheDir = options.cacheDir || path.join(process.cwd(), '.ttb-cache');
        this.retries = options.retries || 3;
        this.axiosInstance = axios_1.default.create({
            timeout: options.timeout || 30000,
            headers: {
                'User-Agent': 'TTB-Label-Analyzer/1.0 (https://github.com/kabirahasaan/ttb-label-analyzer)',
                Accept: 'text/html,text/plain',
            },
        });
        this.ensureCacheDir();
    }
    ensureCacheDir() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }
    /**
     * Main TTB labeling requirements document
     * CFR 27 Part 4-5 (Alcohol Beverage Labeling)
     */
    async fetchBeerWineSpiritsLabelingGuide() {
        const url = 'https://www.ttb.gov/press-center/news-releases/2023-06-29-beer-wine-and-spirits-retail-labeling-requirements';
        return this.fetchAndCache(url, 'beer-wine-spirits-guide');
    }
    /**
     * Beer labeling standards (CFR 27 Part 7)
     */
    async fetchBeerLabelingStandards() {
        const url = 'https://www.ttb.gov/beer/federal-beer-label-requirements-and-guidelines';
        return this.fetchAndCache(url, 'beer-standards');
    }
    /**
     * Wine labeling standards (CFR 27 Part 4)
     */
    async fetchWineLabelingStandards() {
        const url = 'https://www.ttb.gov/wine/wine-labeling-requirements-and-options';
        return this.fetchAndCache(url, 'wine-standards');
    }
    /**
     * Distilled spirits labeling standards (CFR 27 Part 5)
     */
    async fetchSpiritLabelingStandards() {
        const url = 'https://www.ttb.gov/distilled-spirits/federal-distilled-spirits-label-and-packaging-requirements';
        return this.fetchAndCache(url, 'spirits-standards');
    }
    /**
     * Health warning statements
     */
    async fetchHealthWarningRequirements() {
        const url = 'https://www.ttb.gov/alcohol-beverage-labeling/health-warning-statement-text-and-format-requirements';
        return this.fetchAndCache(url, 'health-warning');
    }
    /**
     * Sulfite disclosure requirements
     */
    async fetchSulfiteDisclosureRules() {
        const url = 'https://www.ttb.gov/wine/sulfite-declaration-labeling-requirements';
        return this.fetchAndCache(url, 'sulfite-disclosure');
    }
    /**
     * Net contents declaration rules
     */
    async fetchNetContentsRules() {
        const url = 'https://www.ttb.gov/alcohol-beverage-labeling/net-contents-quantity-declaration-requirements';
        return this.fetchAndCache(url, 'net-contents');
    }
    /**
     * Country of origin requirements
     */
    async fetchCountryOfOriginRules() {
        const url = 'https://www.ttb.gov/alcohol-beverage-labeling/country-of-origin-declaration-requirements';
        return this.fetchAndCache(url, 'country-origin');
    }
    /**
     * Prohibited statements and claims
     */
    async fetchProhibitedStatementsRules() {
        const url = 'https://www.ttb.gov/alcohol-beverage-labeling/prohibited-statements-and-claims';
        return this.fetchAndCache(url, 'prohibited-statements');
    }
    /**
     * Fetch and cache document from URL with retries
     */
    async fetchAndCache(url, cacheKey) {
        const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);
        // Check cache first
        if (fs.existsSync(cachePath)) {
            const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
            // Return cached if less than 7 days old
            const cacheAge = Date.now() - new Date(cached.fetchedAt).getTime();
            if (cacheAge < 7 * 24 * 60 * 60 * 1000) {
                console.log(`Using cached document: ${cacheKey}`);
                return cached;
            }
        }
        // Fetch with retries
        let lastError = null;
        for (let attempt = 1; attempt <= this.retries; attempt++) {
            try {
                console.log(`Fetching ${cacheKey} (attempt ${attempt}/${this.retries})...`);
                const response = await this.axiosInstance.get(url);
                const content = response.data;
                const document = {
                    url,
                    title: this.extractTitle(url),
                    content,
                    fetchedAt: new Date().toISOString(),
                    source: 'ttb.gov',
                };
                // Cache the document
                fs.writeFileSync(cachePath, JSON.stringify(document, null, 2));
                console.log(`✓ Fetched and cached: ${cacheKey}`);
                return document;
            }
            catch (error) {
                lastError = error;
                console.warn(`Attempt ${attempt} failed: ${error.message}`);
                if (attempt < this.retries) {
                    // Exponential backoff
                    await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
        throw new Error(`Failed to fetch ${cacheKey} after ${this.retries} attempts: ${lastError?.message}`);
    }
    /**
     * Extract title from URL
     */
    extractTitle(url) {
        // Extract the last part of URL and make it human-readable
        const slug = url.split('/').pop() || 'document';
        return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }
    /**
     * Fetch all documents
     */
    async fetchAllDocuments() {
        const documents = [];
        try {
            documents.push(await this.fetchBeerWineSpiritsLabelingGuide());
        }
        catch (e) {
            console.error('Failed to fetch beer/wine/spirits guide:', e);
        }
        try {
            documents.push(await this.fetchBeerLabelingStandards());
        }
        catch (e) {
            console.error('Failed to fetch beer standards:', e);
        }
        try {
            documents.push(await this.fetchWineLabelingStandards());
        }
        catch (e) {
            console.error('Failed to fetch wine standards:', e);
        }
        try {
            documents.push(await this.fetchSpiritLabelingStandards());
        }
        catch (e) {
            console.error('Failed to fetch spirit standards:', e);
        }
        try {
            documents.push(await this.fetchHealthWarningRequirements());
        }
        catch (e) {
            console.error('Failed to fetch health warning:', e);
        }
        try {
            documents.push(await this.fetchSulfiteDisclosureRules());
        }
        catch (e) {
            console.error('Failed to fetch sulfite rules:', e);
        }
        try {
            documents.push(await this.fetchNetContentsRules());
        }
        catch (e) {
            console.error('Failed to fetch net contents rules:', e);
        }
        try {
            documents.push(await this.fetchCountryOfOriginRules());
        }
        catch (e) {
            console.error('Failed to fetch country of origin rules:', e);
        }
        try {
            documents.push(await this.fetchProhibitedStatementsRules());
        }
        catch (e) {
            console.error('Failed to fetch prohibited statements:', e);
        }
        return documents;
    }
    /**
     * Clear cache
     */
    clearCache() {
        if (fs.existsSync(this.cacheDir)) {
            fs.rmSync(this.cacheDir, { recursive: true, force: true });
        }
        this.ensureCacheDir();
        console.log('Cache cleared');
    }
    /**
     * Get cache directory
     */
    getCacheDir() {
        return this.cacheDir;
    }
}
exports.TTBFetcher = TTBFetcher;
//# sourceMappingURL=ttb-fetcher.js.map