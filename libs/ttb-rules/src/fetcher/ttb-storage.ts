import * as fs from 'fs';
import * as path from 'path';
import { ParsedTTBRule } from './ttb-parser';

/**
 * TTB Rules Storage
 * Manages persistent storage of parsed TTB rules in JSON format
 */
export class TTBRulesStorage {
  private rulesDir: string;

  constructor(rulesDir?: string) {
    this.rulesDir = rulesDir || path.join(__dirname, '../data/rules');
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist(): void {
    if (!fs.existsSync(this.rulesDir)) {
      fs.mkdirSync(this.rulesDir, { recursive: true });
    }
  }

  /**
   * Save all rules to JSON files organized by category
   */
  saveRules(rules: ParsedTTBRule[]): void {
    // Organize by category
    const rulesByCategory = this.organizeByCategory(rules);

    // Save each category to its own file
    for (const [category, categoryRules] of Object.entries(rulesByCategory)) {
      const filePath = path.join(this.rulesDir, `${category}-rules.json`);
      fs.writeFileSync(filePath, JSON.stringify(categoryRules, null, 2));
      console.log(`✓ Saved ${categoryRules.length} ${category} rules`);
    }

    // Save all rules to single file
    const allRulesPath = path.join(this.rulesDir, 'all-rules.json');
    fs.writeFileSync(allRulesPath, JSON.stringify(rules, null, 2));
    console.log(`✓ Saved ${rules.length} total rules to all-rules.json`);

    // Save metadata
    this.saveMetadata(rules);
  }

  /**
   * Load all rules from storage
   */
  loadAllRules(): ParsedTTBRule[] {
    const allRulesPath = path.join(this.rulesDir, 'all-rules.json');

    if (!fs.existsSync(allRulesPath)) {
      console.warn('No rules found. run "npm run fetch:ttb-rules" first');
      return [];
    }

    const content = fs.readFileSync(allRulesPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Load rules by category
   */
  loadRulesByCategory(category: string): ParsedTTBRule[] {
    const filePath = path.join(this.rulesDir, `${category}-rules.json`);

    if (!fs.existsSync(filePath)) {
      console.warn(`No rules found for category: ${category}`);
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Load rules by beverage type
   */
  loadRulesByBeverageType(beverageType: string): ParsedTTBRule[] {
    const all = this.loadAllRules();
    return all.filter((rule) => rule.applicableTo.includes(beverageType.toLowerCase()));
  }

  /**
   * Load rules by ID
   */
  loadRuleById(ruleId: string): ParsedTTBRule | undefined {
    const all = this.loadAllRules();
    return all.find((rule) => rule.id === ruleId);
  }

  /**
   * Load rules by IDs
   */
  loadRulesById(ruleIds: string[]): ParsedTTBRule[] {
    const all = this.loadAllRules();
    const idSet = new Set(ruleIds);
    return all.filter((rule) => idSet.has(rule.id));
  }

  /**
   * Search rules by keyword
   */
  searchRules(keyword: string): ParsedTTBRule[] {
    const all = this.loadAllRules();
    const lowerKeyword = keyword.toLowerCase();

    return all.filter(
      (rule) =>
        rule.name.toLowerCase().includes(lowerKeyword) ||
        rule.description.toLowerCase().includes(lowerKeyword) ||
        rule.requirements.some((req) => req.toLowerCase().includes(lowerKeyword))
    );
  }

  /**
   * Get rules statistics
   */
  getStatistics(): {
    totalRules: number;
    byCategory: Record<string, number>;
    byBeverageType: Record<string, number>;
    lastUpdated: string;
  } {
    const all = this.loadAllRules();

    const byCategory: Record<string, number> = {};
    const byBeverageType: Record<string, number> = {};

    for (const rule of all) {
      byCategory[rule.category] = (byCategory[rule.category] || 0) + 1;
      for (const type of rule.applicableTo) {
        byBeverageType[type] = (byBeverageType[type] || 0) + 1;
      }
    }

    const metadata = this.loadMetadata();

    return {
      totalRules: all.length,
      byCategory,
      byBeverageType,
      lastUpdated: metadata?.lastUpdated || 'unknown',
    };
  }

  /**
   * Export rules to CSV
   */
  exportToCSV(): string {
    const all = this.loadAllRules();

    const headers = [
      'ID',
      'Name',
      'Category',
      'Description',
      'Applicable To',
      'CFR Reference',
      'Source',
      'Last Updated',
    ];

    const rows = all.map((rule) => [
      rule.id,
      rule.name,
      rule.category,
      rule.description,
      rule.applicableTo.join(';'),
      rule.cfr || '',
      rule.source.document,
      rule.lastUpdated,
    ]);

    // Escape CSV fields
    const csvRows = rows.map((row) =>
      row
        .map((cell) => {
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(',')
    );

    return [headers.join(','), ...csvRows].join('\n');
  }

  /**
   * Export rules to JSON
   */
  exportToJSON(): string {
    const all = this.loadAllRules();
    return JSON.stringify(all, null, 2);
  }

  /**
   * Clear all stored rules
   */
  clearRules(): void {
    if (fs.existsSync(this.rulesDir)) {
      fs.rmSync(this.rulesDir, { recursive: true, force: true });
    }
    this.ensureDirectoriesExist();
    console.log('Rules cleared');
  }

  /**
   * Get rules directory
   */
  getRulesDir(): string {
    return this.rulesDir;
  }

  /**
   * Organize rules by category
   */
  private organizeByCategory(rules: ParsedTTBRule[]): Record<string, ParsedTTBRule[]> {
    const organized: Record<string, ParsedTTBRule[]> = {
      required: [],
      conditional: [],
      prohibited: [],
      warning: [],
    };

    for (const rule of rules) {
      if (!organized[rule.category]) {
        organized[rule.category] = [];
      }
      organized[rule.category].push(rule);
    }

    return organized;
  }

  /**
   * Save metadata about rules
   */
  private saveMetadata(rules: ParsedTTBRule[]): void {
    const metadataPath = path.join(this.rulesDir, 'metadata.json');

    const byCategory: Record<string, number> = {};
    const byBeverageType: Record<string, number> = {};

    for (const rule of rules) {
      byCategory[rule.category] = (byCategory[rule.category] || 0) + 1;
      for (const type of rule.applicableTo) {
        byBeverageType[type] = (byBeverageType[type] || 0) + 1;
      }
    }

    const metadata = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      totalRules: rules.length,
      categories: byCategory,
      beverageTypes: byBeverageType,
      statisticsPerType: this.calculateStatistics(rules),
    };

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log('✓ Saved metadata');
  }

  /**
   * Load metadata
   */
  private loadMetadata(): any {
    const metadataPath = path.join(this.rulesDir, 'metadata.json');

    if (!fs.existsSync(metadataPath)) {
      return null;
    }

    const content = fs.readFileSync(metadataPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Calculate statistics per beverage type
   */
  private calculateStatistics(rules: ParsedTTBRule[]): Record<string, any> {
    const types: Record<string, any> = {
      beer: { total: 0, required: 0, conditional: 0, prohibited: 0, warning: 0 },
      wine: { total: 0, required: 0, conditional: 0, prohibited: 0, warning: 0 },
      spirits: { total: 0, required: 0, conditional: 0, prohibited: 0, warning: 0 },
      mead: { total: 0, required: 0, conditional: 0, prohibited: 0, warning: 0 },
      cider: { total: 0, required: 0, conditional: 0, prohibited: 0, warning: 0 },
    };

    for (const rule of rules) {
      for (const type of rule.applicableTo) {
        if (types[type]) {
          types[type].total++;
          types[type][rule.category]++;
        }
      }
    }

    return types;
  }
}
