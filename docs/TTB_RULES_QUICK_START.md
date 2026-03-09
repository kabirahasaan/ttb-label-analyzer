---
title: TTB Rules Quick Start
layout: default
permalink: /ttb-rules-quick-start
---

# TTB Rules - Quick Start Guide

Get TTB labeling rules from official sources and use them in validation.

## TL;DR

```bash
# 1. Fetch rules from TTB.gov
npm run fetch:ttb-rules

# 2. Check what was loaded
npm run fetch:ttb-rules:stats

# 3. Use in validation engine
# See TTB_RULES_INTEGRATION.md for implementation details
```

## What You Get

When you run `npm run fetch:ttb-rules`, you get:

📋 **all-rules.json** (27+ federal rules)

- Brand name requirements
- ABV (alcohol content) requirements
- Health warning statements
- Net contents declaration
- Country of origin
- Prohibited statements
- And much more...

📊 **metadata.json** (statistics)

- Total rules by category
- Total rules by beverage type
- Last update timestamp

📁 **Organized by category**

- `required-rules.json` - Must be on label
- `conditional-rules.json` - Required in specific cases
- `prohibited-rules.json` - Cannot appear on label

## Commands

```bash
# Fetch & parse from TTB.gov (one-time + weekly updates)
npm run fetch:ttb-rules

# View statistics only
npm run fetch:ttb-rules:stats

# Use cached data (no network)
npm run fetch:ttb-rules:cached-only

# Export as CSV spreadsheet
npm run fetch:ttb-rules:export-csv
```

## Use in Code

### Load All Rules

```typescript
import { TTBRulesStorage } from '@ttb/ttb-rules';

const storage = new TTBRulesStorage();
const allRules = storage.loadAllRules();
console.log(`Loaded ${allRules.length} rules`);
```

### Load Rules for Specific Beverage

```typescript
// Get beer rules
const beerRules = storage.loadRulesByBeverageType('beer');

// Get wine rules
const wineRules = storage.loadRulesByBeverageType('wine');

// Get spirits rules
const spiritRules = storage.loadRulesByBeverageType('spirits');
```

### Search Rules

```typescript
// Find rules about "brand"
const results = storage.searchRules('brand');
```

### Get Single Rule

```typescript
const rule = storage.loadRuleById('brand-name-required');

// Access rule details
console.log(rule.name); // "Brand Name Required"
console.log(rule.category); // "required"
console.log(rule.requirements); // ["requirement 1", ...]
console.log(rule.cfr); // "27 CFR § 4.28"
```

### Get Statistics

```typescript
const stats = storage.getStatistics();

console.log(stats.totalRules); // 27
console.log(stats.byCategory); // { required: 15, conditional: 8, ... }
console.log(stats.byBeverageType); // { beer: 12, wine: 14, ... }
console.log(stats.lastUpdated); // "2024-01-15T..."
```

## Rule Structure

Each rule contains:

```json
{
  "id": "brand-name-required",
  "name": "Brand Name Required",
  "category": "required",
  "description": "All alcoholic beverage labels must display a brand name...",
  "requirements": [
    "Brand name must be displayed on the front label",
    "Brand name must be easily readable",
    "Brand name must be in English or translation provided"
  ],
  "applicableTo": ["beer", "wine", "spirits", "mead", "cider"],
  "source": {
    "document": "Beer Wine And Spirits Guide",
    "url": "https://www.ttb.gov/...",
    "cfr": "27 CFR § 4.28"
  },
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

## Categories

- **required** (15) - Must be present: brand, ABV, warnings, etc.
- **conditional** (8) - Required only sometimes: sulfites for wine, origin for imports
- **prohibited** (3) - Cannot appear: health claims, misleading statements
- **warning** (1) - Special attention needed

## Data Sources

Rules are fetched from official TTB.gov pages:

- 🔗 Beer standards (CFR 27 Part 7)
- 🔗 Wine standards (CFR 27 Part 4)
- 🔗 Spirits standards (CFR 27 Part 5)
- 🔗 Health warnings
- 🔗 Sulfite disclosure (wine)
- 🔗 Net contents
- 🔗 Country of origin
- 🔗 Prohibited statements

## Caching

Rules are automatically cached locally:

- ✅ First run: Downloads from TTB.gov
- ✅ Cached: Reuses local copy (7 days)
- ✅ Auto-refresh: Updates if > 7 days old
- ✅ Clear cache: `npm run fetch:ttb-rules -- --clear-cache`

## Integration with Validation Engine

```typescript
import { TTBRulesEngine } from '@ttb/ttb-rules';

// Create engine with rules storage
const engine = new TTBRulesEngine('libs/ttb-rules/data/rules');

// Load rules for beer
const rules = engine.loadDynamicRules('beer');

// Validate label
const label = {
  brandName: 'Premium Ale',
  alcoholByVolume: 5.5,
  netContents: '12 fl oz',
  // ...
};

// Apply rules manually or via validateAllRules()
```

## Common Tasks

### Update rules weekly

```bash
npm run fetch:ttb-rules
```

### Check what rules apply to beer

```bash
npm run fetch:ttb-rules:stats
# Then look at byBeverageType.beer
```

### Get rule details for compliance report

```typescript
const rule = storage.loadRuleById('brand-name-required');
console.log(`Rule: ${rule.name}`);
console.log(`CFR: ${rule.cfr}`);
console.log(`Requirements:`);
rule.requirements.forEach((r) => console.log(`  - ${r}`));
```

### Build compliance checklist for label

```typescript
const rules = storage.loadRulesByBeverageType('wine');
const checklist = rules.map((r) => ({
  name: r.name,
  required: r.category === 'required',
  items: r.requirements,
}));
```

### Export for auditing

```bash
npm run fetch:ttb-rules:export-csv
# Creates libs/ttb-rules/data/rules/rules.csv
```

## Troubleshooting

**Q: "No cached rules found"**  
A: Run `npm run fetch:ttb-rules` to download

**Q: Network timeout**  
A: Check internet, or use `npm run fetch:ttb-rules:cached-only`

**Q: Want rules in different format?**  
A: Export as CSV with `npm run fetch:ttb-rules:export-csv`

**Q: Need latest rules?**  
A: Run `npm run fetch:ttb-rules -- --clear-cache`

## Next Steps

1. ✅ Run `npm run fetch:ttb-rules`
2. ✅ Check stats with `npm run fetch:ttb-rules:stats`
3. ✅ See [TTB_RULES_INTEGRATION.md](./TTB_RULES_INTEGRATION.html) to use in validation
4. ✅ Run tests: `npm test`

## References

- [TTB Official Website](https://www.ttb.gov/)
- [TTB Rules README](./libs/ttb-rules/README.html) - Full documentation
- [Integration Guide](./TTB_RULES_INTEGRATION.html) - Backend/frontend integration
- [CFR 27 - Alcohol Labeling](https://www.ecfr.gov/current/title-27)

---

**Status**: ✅ Ready to use  
**Last Updated**: January 2024  
**Rule Count**: 27+ official TTB rules
