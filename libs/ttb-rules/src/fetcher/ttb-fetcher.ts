import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

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

export class TTBFetcher {
  private axiosInstance: AxiosInstance;
  private cacheDir: string;
  private retries: number = 3;

  constructor(options: FetchOptions = {}) {
    this.cacheDir = options.cacheDir || path.join(process.cwd(), '.ttb-cache');
    this.retries = options.retries || 3;

    this.axiosInstance = axios.create({
      timeout: options.timeout || 30000,
      headers: {
        'User-Agent': 'TTB-Label-Analyzer/1.0 (https://github.com/kabirahasaan/ttb-label-analyzer)',
        Accept: 'text/html,text/plain',
      },
    });

    this.ensureCacheDir();
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Main TTB labeling requirements document
   * CFR 27 Part 4-5 (Alcohol Beverage Labeling)
   */
  async fetchBeerWineSpiritsLabelingGuide(): Promise<TTBRuleDocument> {
    const url =
      'https://www.ttb.gov/press-center/news-releases/2023-06-29-beer-wine-and-spirits-retail-labeling-requirements';
    return this.fetchAndCache(url, 'beer-wine-spirits-guide');
  }

  /**
   * Beer labeling standards (CFR 27 Part 7)
   */
  async fetchBeerLabelingStandards(): Promise<TTBRuleDocument> {
    const url = 'https://www.ttb.gov/beer/federal-beer-label-requirements-and-guidelines';
    return this.fetchAndCache(url, 'beer-standards');
  }

  /**
   * Wine labeling standards (CFR 27 Part 4)
   */
  async fetchWineLabelingStandards(): Promise<TTBRuleDocument> {
    const url = 'https://www.ttb.gov/wine/wine-labeling-requirements-and-options';
    return this.fetchAndCache(url, 'wine-standards');
  }

  /**
   * Distilled spirits labeling standards (CFR 27 Part 5)
   */
  async fetchSpiritLabelingStandards(): Promise<TTBRuleDocument> {
    const url =
      'https://www.ttb.gov/distilled-spirits/federal-distilled-spirits-label-and-packaging-requirements';
    return this.fetchAndCache(url, 'spirits-standards');
  }

  /**
   * Health warning statements
   */
  async fetchHealthWarningRequirements(): Promise<TTBRuleDocument> {
    const url =
      'https://www.ttb.gov/alcohol-beverage-labeling/health-warning-statement-text-and-format-requirements';
    return this.fetchAndCache(url, 'health-warning');
  }

  /**
   * Sulfite disclosure requirements
   */
  async fetchSulfiteDisclosureRules(): Promise<TTBRuleDocument> {
    const url = 'https://www.ttb.gov/wine/sulfite-declaration-labeling-requirements';
    return this.fetchAndCache(url, 'sulfite-disclosure');
  }

  /**
   * Net contents declaration rules
   */
  async fetchNetContentsRules(): Promise<TTBRuleDocument> {
    const url =
      'https://www.ttb.gov/alcohol-beverage-labeling/net-contents-quantity-declaration-requirements';
    return this.fetchAndCache(url, 'net-contents');
  }

  /**
   * Country of origin requirements
   */
  async fetchCountryOfOriginRules(): Promise<TTBRuleDocument> {
    const url =
      'https://www.ttb.gov/alcohol-beverage-labeling/country-of-origin-declaration-requirements';
    return this.fetchAndCache(url, 'country-origin');
  }

  /**
   * Prohibited statements and claims
   */
  async fetchProhibitedStatementsRules(): Promise<TTBRuleDocument> {
    const url = 'https://www.ttb.gov/alcohol-beverage-labeling/prohibited-statements-and-claims';
    return this.fetchAndCache(url, 'prohibited-statements');
  }

  /**
   * Fetch and cache document from URL with retries
   */
  private async fetchAndCache(url: string, cacheKey: string): Promise<TTBRuleDocument> {
    const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);

    // Check cache first
    if (fs.existsSync(cachePath)) {
      const cached: TTBRuleDocument = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      // Return cached if less than 7 days old
      const cacheAge = Date.now() - new Date(cached.fetchedAt).getTime();
      if (cacheAge < 7 * 24 * 60 * 60 * 1000) {
        console.log(`Using cached document: ${cacheKey}`);
        return cached;
      }
    }

    // Fetch with retries
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        console.log(`Fetching ${cacheKey} (attempt ${attempt}/${this.retries})...`);
        const response = await this.axiosInstance.get(url);
        const content = response.data;

        const document: TTBRuleDocument = {
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
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt} failed: ${(error as Error).message}`);
        if (attempt < this.retries) {
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw new Error(
      `Failed to fetch ${cacheKey} after ${this.retries} attempts: ${lastError?.message}`
    );
  }

  /**
   * Extract title from URL
   */
  private extractTitle(url: string): string {
    // Extract the last part of URL and make it human-readable
    const slug = url.split('/').pop() || 'document';
    return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Fetch all documents
   */
  async fetchAllDocuments(): Promise<TTBRuleDocument[]> {
    const documents: TTBRuleDocument[] = [];

    try {
      documents.push(await this.fetchBeerWineSpiritsLabelingGuide());
    } catch (e) {
      console.error('Failed to fetch beer/wine/spirits guide:', e);
    }

    try {
      documents.push(await this.fetchBeerLabelingStandards());
    } catch (e) {
      console.error('Failed to fetch beer standards:', e);
    }

    try {
      documents.push(await this.fetchWineLabelingStandards());
    } catch (e) {
      console.error('Failed to fetch wine standards:', e);
    }

    try {
      documents.push(await this.fetchSpiritLabelingStandards());
    } catch (e) {
      console.error('Failed to fetch spirit standards:', e);
    }

    try {
      documents.push(await this.fetchHealthWarningRequirements());
    } catch (e) {
      console.error('Failed to fetch health warning:', e);
    }

    try {
      documents.push(await this.fetchSulfiteDisclosureRules());
    } catch (e) {
      console.error('Failed to fetch sulfite rules:', e);
    }

    try {
      documents.push(await this.fetchNetContentsRules());
    } catch (e) {
      console.error('Failed to fetch net contents rules:', e);
    }

    try {
      documents.push(await this.fetchCountryOfOriginRules());
    } catch (e) {
      console.error('Failed to fetch country of origin rules:', e);
    }

    try {
      documents.push(await this.fetchProhibitedStatementsRules());
    } catch (e) {
      console.error('Failed to fetch prohibited statements:', e);
    }

    return documents;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    if (fs.existsSync(this.cacheDir)) {
      fs.rmSync(this.cacheDir, { recursive: true, force: true });
    }
    this.ensureCacheDir();
    console.log('Cache cleared');
  }

  /**
   * Get cache directory
   */
  getCacheDir(): string {
    return this.cacheDir;
  }
}
