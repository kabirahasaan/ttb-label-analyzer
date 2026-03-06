# TTB Rules Fetcher & Dynamic Rule Loading

This module provides automated fetching, parsing, and storage of TTB (Alcohol and Tobacco Tax and Trade Bureau) labeling requirements from official sources. Rules are stored in JSON format and can be dynamically loaded by the validation engine.

## Overview

The system consists of four main components:

1. **TTB Fetcher** (`ttb-fetcher.ts`) - Fetches official documents from TTB.gov
2. **TTB Parser** (`ttb-parser.ts`) - Parses HTML content into structured rules
3. **TTB Storage** (`ttb-storage.ts`) - Manages persistent JSON storage
4. **TTB Rules Engine** (`ttb-rules.engine.ts`) - Loads and applies rules

## Architecture

```
TTB.gov
  ↓
TTBFetcher (fetch + cache)
  ↓
TTBRulesParser (parse HTML → structured rules)
  ↓
TTBRulesStorage (save to JSON)
  ↓
JSON Files (all-rules.json, required-rules.json, metadata.json)
  ↓
TTBRulesEngine (load rules dynamically)
  ↓
Validation Engine (apply rules to labels)
```

## Quick Start

### 1. Fetch and Parse TTB Rules

```bash
npm run fetch:ttb-rules
```

This command:

- Fetches official TTB documents from ttb.gov
- Caches documents locally (7-day cache)
- Parses HTML content into structured rules
- Organizes rules by category and beverage type
- Saves to JSON files in `libs/ttb-rules/data/rules/`
- Generates metadata and statistics

### 2. View Rules Statistics

```bash
npm run fetch:ttb-rules:stats
```

Output example:

```
Total Rules: 27

By Category:
  📋 required: 15
  ⚠️  conditional: 8
  🚫 prohibited: 3
  ⚡ warning: 1

By Beverage Type:
  🍺 beer: 12
  🍺 wine: 14
  🍺 spirits: 11
  🍺 mead: 8
  🍺 cider: 8

Last Updated: 2024-01-15T10:30:00Z
```

### 3. Export Rules to CSV

```bash
npm run fetch:ttb-rules:export-csv
```

Creates `libs/ttb-rules/data/rules/rules.csv` with all rules in spreadsheet format.

### 4. Use Cached Data Only

```bash
npm run fetch:ttb-rules:cached-only
```

Uses cached documents without making network requests.

## JSON Rule Structure

### All Rules File: `all-rules.json`

```json
[
  {
    "id": "brand-name-required",
    "name": "Brand Name Required",
    "category": "required",
    "description": "All alcoholic beverage labels must display a brand name...",
    "requirements": [
      "Brand name must be displayed on the front label",
      "Brand name must be easily readable",
      "Brand name must be in English or English translation provided"
    ],
    "applicableTo": ["beer", "wine", "spirits", "mead", "cider"],
    "source": {
      "document": "Beer Wine And Spirits Guide",
      "url": "https://www.ttb.gov/...",
      "cfr": "27 CFR § 4.28, § 5.37, § 7.51"
    },
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
]
```

### Metadata File: `metadata.json`

```json
{
  "version": "1.0",
  "lastUpdated": "2024-01-15T10:30:00Z",
  "totalRules": 27,
  "categories": {
    "required": 15,
    "conditional": 8,
    "prohibited": 3,
    "warning": 1
  },
  "beverageTypes": {
    "beer": 12,
    "wine": 14,
    "spirits": 11,
    "mead": 8,
    "cider": 8
  }
}
```

## Rule Categories

- **required** (15) - Must be present on label (brand name, ABV, warnings, etc.)
- **conditional** (8) - Required only in specific circumstances (sulfites for wine, origin for imports, etc.)
- **prohibited** (3) - Cannot appear on label (health claims, misleading statements, etc.)
- **warning** (1) - Special attention required

## Programmatic Usage

### Load All Rules

```typescript
import { TTBRulesStorage } from '@ttb/ttb-rules';

const storage = new TTBRulesStorage();
const allRules = storage.loadAllRules();

console.log(`Loaded ${allRules.length} rules`);
```

### Load Rules by Category

```typescript
// Get all required rules
const requiredRules = storage.loadRulesByCategory('required');

// Get conditional rules
const conditionalRules = storage.loadRulesByCategory('conditional');
```

### Load Rules by Beverage Type

```typescript
// Get all rules applicable to beer
const beerRules = storage.loadRulesByBeverageType('beer');

// Get all rules applicable to wine
const wineRules = storage.loadRulesByBeverageType('wine');
```

### Search Rules

```typescript
// Search by keyword
const results = storage.searchRules('health');

// Results will include rules matching "health" in:
// - Rule name
// - Description
// - Requirements
```

### Get Rule by ID

```typescript
const rule = storage.loadRuleById('brand-name-required');

console.log(rule.name); // "Brand Name Required"
console.log(rule.requirements); // Array of requirements
console.log(rule.applicableTo); // ["beer", "wine", "spirits", ...]
```

### Get Statistics

```typescript
const stats = storage.getStatistics();

console.log(stats.totalRules); // 27
console.log(stats.byCategory); // { required: 15, conditional: 8, ... }
console.log(stats.byBeverageType); // { beer: 12, wine: 14, ... }
console.log(stats.lastUpdated); // "2024-01-15T10:30:00Z"
```

### Export Rules

```typescript
// Export as CSV
const csv = storage.exportToCSV();
fs.writeFileSync('rules.csv', csv);

// Export as JSON
const json = storage.exportToJSON();
fs.writeFileSync('rules.json', json);
```

## Integration with Validation Engine

### Initialize with Dynamic Rules

```typescript
import { TTBRulesEngine } from '@ttb/ttb-rules';

// Create engine with access to rules storage
const engine = new TTBRulesEngine(
  'libs/ttb-rules/data/rules' // Storage directory
);

// Load all rules for a specific beverage type
const beerRules = engine.loadDynamicRules('beer');
console.log(`Loaded ${beerRules.length} beer rules`);

// Check if dynamic rules loaded successfully
if (engine.hasDynamicRules()) {
  console.log('Rules loaded successfully');
}

// Search for specific rule
const rule = engine.getRule('brand-name-required');
console.log(rule?.description);
```

### Get Rules Statistics

```typescript
const stats = engine.getRulesStatistics();
console.log(`Total rules: ${stats.totalRules}`);
console.log(`Required: ${stats.byCategory.required}`);
```

## TTB Data Sources

The fetcher retrieves information from these official TTB.gov pages:

1. **Beer/Wine/Spirits Labeling Guide**
   - URL: https://www.ttb.gov/beer/federal-beer-label-requirements
   - Contains general labeling requirements

2. **Beer Standards** (CFR 27 Part 7)
   - URL: https://www.ttb.gov/beer/federal-beer-label-requirements-and-guidelines
   - Beer-specific rules

3. **Wine Standards** (CFR 27 Part 4)
   - URL: https://www.ttb.gov/wine/wine-labeling-requirements-and-options
   - Wine-specific rules

4. **Distilled Spirits Standards** (CFR 27 Part 5)
   - URL: https://www.ttb.gov/distilled-spirits/federal-distilled-spirits-label-and-packaging-requirements
   - Spirits-specific rules

5. **Health Warning Statement**
   - URL: https://www.ttb.gov/alcohol-beverage-labeling/health-warning-statement-text-and-format-requirements

6. **Sulfite Disclosure** (Wine)
   - URL: https://www.ttb.gov/wine/sulfite-declaration-labeling-requirements

7. **Net Contents Requirements**
   - URL: https://www.ttb.gov/alcohol-beverage-labeling/net-contents-quantity-declaration-requirements

8. **Country of Origin**
   - URL: https://www.ttb.gov/alcohol-beverage-labeling/country-of-origin-declaration-requirements

9. **Prohibited Statements**
   - URL: https://www.ttb.gov/alcohol-beverage-labeling/prohibited-statements-and-claims

## Caching

Documents are automatically cached locally for performance:

- **Cache Location**: `.ttb-cache/` (root of project)
- **Cache Duration**: 7 days
- **Auto-refresh**: Automatically refreshed if older than 7 days
- **Clear Cache**: `npm run fetch:ttb-rules -- --clear-cache`

## File Structure

```
libs/ttb-rules/
├── src/
│   ├── fetcher/
│   │   ├── ttb-fetcher.ts        # Fetch documents from TTB.gov
│   │   ├── ttb-parser.ts         # Parse into structured rules
│   │   ├── ttb-storage.ts        # Manage JSON storage
│   │   ├── fetch-ttb-rules.ts    # CLI script
│   │   └── index.ts              # Exports
│   ├── data/
│   │   └── rules/
│   │       ├── all-rules.json               # All rules
│   │       ├── required-rules.json          # Required rules only
│   │       ├── conditional-rules.json       # Conditional rules
│   │       ├── prohibited-rules.json        # Prohibited rules
│   │       ├── metadata.json                # Statistics & metadata
│   │       └── rules.csv                    # CSV export (generated)
│   ├── ttb-rules.engine.ts       # Engine with dynamic loading
│   └── index.ts
└── package.json
```

## Development

### Add New Rule Source

Edit `ttb-fetcher.ts` and add:

```typescript
async fetchMyNewRule(): Promise<TTBRuleDocument> {
  const url = 'https://www.ttb.gov/...';
  return this.fetchAndCache(url, 'my-new-rule');
}
```

Then add to `fetchAllDocuments()`:

```typescript
try {
  documents.push(await this.fetchMyNewRule());
} catch (e) {
  console.error('Failed to fetch my new rule:', e);
}
```

### Add New Rule Parser

Edit `ttb-parser.ts` and add:

```typescript
private parseMyNewRules(doc: TTBRuleDocument): ParsedTTBRule[] {
  return [
    {
      id: 'my-rule-id',
      name: 'My Rule Name',
      category: 'required',
      description: 'Description',
      requirements: ['Requirement 1', 'Requirement 2'],
      applicableTo: ['beer', 'wine'],
      source: { ... },
      lastUpdated: doc.fetchedAt,
    },
  ];
}
```

Then call from `parseDocuments()`:

```typescript
if (doc.title.includes('My Rule')) {
  rules.push(...this.parseMyNewRules(doc));
}
```

## Troubleshooting

### "No rules found" Error

Run the fetcher to download and parse rules:

```bash
npm run fetch:ttb-rules
```

### Network Timeout

- Check internet connection
- Clear cache and retry: `npm run fetch:ttb-rules -- --clear-cache`
- Use cached-only mode: `npm run fetch:ttb-rules:cached-only`

### Rules Not Loading in Engine

Ensure the storage directory exists and contains JSON files:

```bash
ls -la libs/ttb-rules/data/rules/
```

### CSV Export Not Working

Ensure you have write permissions in the `libs/ttb-rules/data/rules/` directory.

## Best Practices

1. **Update Regularly**: TTB rules change - update quarterly with:

   ```bash
   npm run fetch:ttb-rules
   ```

2. **Version Control**: Commit the JSON rule files to version control

3. **Test Rules**: Create unit tests for rule validation:

   ```typescript
   const rule = storage.loadRuleById('brand-name-required');
   expect(rule?.category).toBe('required');
   ```

4. **Monitor Updates**: Subscribe to TTB.gov for rule changes

5. **Use in CI/CD**: Add rule validation to your CI pipeline

## References

- [TTB Official Website](https://www.ttb.gov/)
- [CFR 27 - Alcohol Beverage Labeling](https://www.ecfr.gov/current/title-27)
- [27 CFR Part 4 - Wine](https://www.ecfr.gov/current/title-27/part-4)
- [27 CFR Part 5 - Distilled Spirits](https://www.ecfr.gov/current/title-27/part-5)
- [27 CFR Part 7 - Beer](https://www.ecfr.gov/current/title-27/part-7)

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Status**: Production Ready
