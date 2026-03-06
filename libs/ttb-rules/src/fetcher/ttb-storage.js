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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTBRulesStorage = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * TTB Rules Storage
 * Manages persistent storage of parsed TTB rules in JSON format
 */
class TTBRulesStorage {
    constructor(rulesDir) {
        this.rulesDir = rulesDir || path.join(__dirname, '../data/rules');
        this.ensureDirectoriesExist();
    }
    ensureDirectoriesExist() {
        if (!fs.existsSync(this.rulesDir)) {
            fs.mkdirSync(this.rulesDir, { recursive: true });
        }
    }
    /**
     * Save all rules to JSON files organized by category
     */
    saveRules(rules) {
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
    loadAllRules() {
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
    loadRulesByCategory(category) {
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
    loadRulesByBeverageType(beverageType) {
        const all = this.loadAllRules();
        return all.filter((rule) => rule.applicableTo.includes(beverageType.toLowerCase()));
    }
    /**
     * Load rules by ID
     */
    loadRuleById(ruleId) {
        const all = this.loadAllRules();
        return all.find((rule) => rule.id === ruleId);
    }
    /**
     * Load rules by IDs
     */
    loadRulesById(ruleIds) {
        const all = this.loadAllRules();
        const idSet = new Set(ruleIds);
        return all.filter((rule) => idSet.has(rule.id));
    }
    /**
     * Search rules by keyword
     */
    searchRules(keyword) {
        const all = this.loadAllRules();
        const lowerKeyword = keyword.toLowerCase();
        return all.filter((rule) => rule.name.toLowerCase().includes(lowerKeyword) ||
            rule.description.toLowerCase().includes(lowerKeyword) ||
            rule.requirements.some((req) => req.toLowerCase().includes(lowerKeyword)));
    }
    /**
     * Get rules statistics
     */
    getStatistics() {
        const all = this.loadAllRules();
        const byCategory = {};
        const byBeverageType = {};
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
    exportToCSV() {
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
        const csvRows = rows.map((row) => row
            .map((cell) => {
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        })
            .join(','));
        return [headers.join(','), ...csvRows].join('\n');
    }
    /**
     * Export rules to JSON
     */
    exportToJSON() {
        const all = this.loadAllRules();
        return JSON.stringify(all, null, 2);
    }
    /**
     * Clear all stored rules
     */
    clearRules() {
        if (fs.existsSync(this.rulesDir)) {
            fs.rmSync(this.rulesDir, { recursive: true, force: true });
        }
        this.ensureDirectoriesExist();
        console.log('Rules cleared');
    }
    /**
     * Get rules directory
     */
    getRulesDir() {
        return this.rulesDir;
    }
    /**
     * Organize rules by category
     */
    organizeByCategory(rules) {
        const organized = {
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
    saveMetadata(rules) {
        const metadataPath = path.join(this.rulesDir, 'metadata.json');
        const byCategory = {};
        const byBeverageType = {};
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
    loadMetadata() {
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
    calculateStatistics(rules) {
        const types = {
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
exports.TTBRulesStorage = TTBRulesStorage;
//# sourceMappingURL=ttb-storage.js.map