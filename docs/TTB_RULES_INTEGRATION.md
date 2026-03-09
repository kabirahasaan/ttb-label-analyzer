---
title: TTB Rules Integration
layout: default
permalink: /ttb-rules-integration
---

# TTB Rules Integration Guide

This guide explains how to integrate the TTB dynamic rule fetching system with your validation engine and API.

## Table of Contents

1. [Overview](#overview)
2. [Integration Steps](#integration-steps)
3. [Backend Integration](#backend-integration)
4. [Frontend Integration](#frontend-integration)
5. [Testing](#testing)
6. [Deployment](#deployment)

---

## Overview

The TTB Rules system provides:

- ✅ Automated fetching from official TTB.gov sources
- ✅ Structured JSON storage for all rules
- ✅ Dynamic rule loading by beverage type
- ✅ Search and query capabilities
- ✅ Rule statistics and metadata
- ✅ CSV exports for auditing

Integration points:

1. **Backend API** - Load rules and apply during validation
2. **Validation Service** - Use rules in label validation logic
3. **Admin Dashboard** - View and manage rules
4. **Frontend** - Display rule information to users

---

## Integration Steps

### Step 1: Fetch Initial Rules

```bash
npm run fetch:ttb-rules
```

This creates:

- `libs/ttb-rules/data/rules/all-rules.json` - Complete rule set
- `libs/ttb-rules/data/rules/metadata.json` - Statistics
- `libs/ttb-rules/data/rules/required-rules.json` - Required rules
- `libs/ttb-rules/data/rules/conditional-rules.json` - Conditional rules
- `libs/ttb-rules/data/rules/prohibited-rules.json` - Prohibited rules

### Step 2: Update Validation Service

Replace hardcoded rules with dynamic loading:

**Before** (static/hardcoded):

```typescript
// apps/api/src/app/modules/validation/validation.service.ts
export class ValidationService {
  private rules = [
    { id: 'brand-name', check: (label) => !!label.brandName },
    { id: 'abv', check: (label) => label.abv >= 0 && label.abv <= 100 },
  ];

  validate(label: LabelData): ValidationResult {
    // Apply hardcoded rules
  }
}
```

**After** (dynamic):

```typescript
// apps/api/src/app/modules/validation/validation.service.ts
import { TTBRulesStorage } from '@ttb/ttb-rules';

@Injectable()
export class ValidationService {
  private ruleStorage: TTBRulesStorage;

  constructor(private logger: LoggerService) {
    const rulesDir = path.join(process.cwd(), 'libs/ttb-rules/data/rules');
    this.ruleStorage = new TTBRulesStorage(rulesDir);
  }

  async validateLabel(label: LabelData, beverageType?: string): Promise<ValidationResult> {
    // Load applicable rules
    const rules = beverageType
      ? this.ruleStorage.loadRulesByBeverageType(beverageType)
      : this.ruleStorage.loadAllRules();

    // Apply rules
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of rules) {
      const result = this.applyRule(rule, label);
      if (!result.passed) {
        if (rule.category === 'required') {
          errors.push(result.message);
        } else if (rule.category === 'conditional') {
          warnings.push(result.message);
        }
      }
    }

    return {
      isCompliant: errors.length === 0,
      errors,
      warnings,
      appliedRules: rules.length,
    };
  }

  private applyRule(rule: ParsedTTBRule, label: LabelData): RuleResult {
    // Implement rule logic
    switch (rule.id) {
      case 'brand-name-required':
        return {
          passed: !!label.brandName && label.brandName.length > 0,
          message: 'Brand name is required',
        };
      case 'abv-statement-required':
        return {
          passed: label.alcoholByVolume !== undefined,
          message: 'ABV must be stated on label',
        };
      // ... more rules
      default:
        return { passed: true, message: '' };
    }
  }
}
```

### Step 3: Add Rule Management Controller

```typescript
// apps/api/src/app/modules/rules/rules.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { RulesService } from './rules.service';

@Controller('api/rules')
export class RulesController {
  constructor(private rulesService: RulesService) {}

  @Get('/')
  getAllRules(@Query('category') category?: string) {
    return this.rulesService.getRules(category);
  }

  @Get('/stats')
  getStatistics() {
    return this.rulesService.getStatistics();
  }

  @Get('/search')
  searchRules(@Query('q') keyword: string) {
    return this.rulesService.searchRules(keyword);
  }

  @Get('/beverage/:type')
  getRulesByBeverageType(@Param('type') beverageType: string) {
    return this.rulesService.getRulesByBeverageType(beverageType);
  }

  @Get('/:id')
  getRule(@Param('id') ruleId: string) {
    return this.rulesService.getRule(ruleId);
  }
}
```

### Step 4: Implement Rules Service

```typescript
// apps/api/src/app/modules/rules/rules.service.ts
import { Injectable } from '@nestjs/common';
import { TTBRulesStorage } from '@ttb/ttb-rules';
import * as path from 'path';

@Injectable()
export class RulesService {
  private storage: TTBRulesStorage;

  constructor() {
    const rulesDir = path.join(process.cwd(), 'libs/ttb-rules/data/rules');
    this.storage = new TTBRulesStorage(rulesDir);
  }

  getRules(category?: string) {
    if (category) {
      return this.storage.loadRulesByCategory(category);
    }
    return this.storage.loadAllRules();
  }

  getStatistics() {
    return this.storage.getStatistics();
  }

  searchRules(keyword: string) {
    return this.storage.searchRules(keyword);
  }

  getRulesByBeverageType(beverageType: string) {
    return this.storage.loadRulesByBeverageType(beverageType);
  }

  getRule(ruleId: string) {
    return this.storage.loadRuleById(ruleId);
  }
}
```

### Step 5: Register Module in AppModule

```typescript
// apps/api/src/app/app.module.ts
import { Module } from '@nestjs/common';
import { RulesController } from './modules/rules/rules.controller';
import { RulesService } from './modules/rules/rules.service';

@Module({
  controllers: [RulesController],
  providers: [RulesService],
  exports: [RulesService],
})
export class RulesModule {}

@Module({
  imports: [RulesModule /* other modules */],
})
export class AppModule {}
```

---

## Backend Integration

### Example: Validate Label with Dynamic Rules

```typescript
// apps/api/src/app/modules/label/label.service.ts
import { Injectable } from '@nestjs/common';
import { ValidationService } from '../validation/validation.service';

@Injectable()
export class LabelService {
  constructor(private validationService: ValidationService) {}

  async createLabel(dto: CreateLabelDto) {
    // Validate against dynamic rules
    const validation = await this.validationService.validateLabel(dto, dto.classType);

    if (!validation.isCompliant) {
      throw new BadRequestException(`Label validation failed: ${validation.errors.join(', ')}`);
    }

    // Save label
    return {
      id: generateId(),
      ...dto,
      validatedAt: new Date(),
      appliedRules: validation.appliedRules,
    };
  }
}
```

### API Response Example

```bash
GET /api/labels/validate
POST /api/labels
{
  "brandName": "Premium Ale",
  "alcoholByVolume": 5.5,
  "netContents": "12 fl oz",
  "governmentWarning": "WARNING: ...",
  "classType": "beer",
  "producerName": "Brewery Inc"
}

Response:
{
  "isCompliant": true,
  "errors": [],
  "warnings": [],
  "appliedRules": 12,
  "ruleDetails": [
    {
      "ruleId": "brand-name-required",
      "passed": true,
      "message": ""
    },
    {
      "ruleId": "abv-statement-required",
      "passed": true,
      "message": ""
    },
    // ... more rules
  ]
}
```

---

## Frontend Integration

### Display Rules to User

```typescript
// apps/web/src/components/rule-display.tsx
import { useQuery } from 'react-query';

export function RuleDisplay({ beverageType }: { beverageType: string }) {
  const { data: rules, isLoading } = useQuery(
    ['rules', beverageType],
    () =>
      fetch(`/api/rules/beverage/${beverageType}`).then(
        (r) => r.json()
      )
  );

  if (isLoading) return <div>Loading rules...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">
        TTB Requirements for {beverageType}
      </h2>

      {/* Required Rules */}
      <section>
        <h3 className="font-semibold text-red-600">Required ✓</h3>
        {rules
          ?.filter((r) => r.category === 'required')
          .map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
      </section>

      {/* Conditional Rules */}
      <section>
        <h3 className="font-semibold text-yellow-600">Conditional ⚠</h3>
        {rules
          ?.filter((r) => r.category === 'conditional')
          .map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
      </section>

      {/* Prohibited Rules */}
      <section>
        <h3 className="font-semibold text-red-600">Prohibited ✗</h3>
        {rules
          ?.filter((r) => r.category === 'prohibited')
          .map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
      </section>
    </div>
  );
}

function RuleCard({ rule }) {
  return (
    <div className="border rounded p-3 bg-gray-50">
      <h4 className="font-medium">{rule.name}</h4>
      <p className="text-sm text-gray-700">{rule.description}</p>
      <ul className="text-sm mt-2 space-y-1">
        {rule.requirements.map((req, i) => (
          <li key={i} className="text-gray-600">
            • {req}
          </li>
        ))}
      </ul>
      {rule.cfr && (
        <p className="text-xs text-gray-500 mt-2">
          Reference: {rule.cfr}
        </p>
      )}
    </div>
  );
}
```

### Validation Result Display

```typescript
// apps/web/src/components/validation-results.tsx
export function ValidationResults({ result }) {
  return (
    <div className="space-y-4">
      {/* Compliance Status */}
      <div
        className={`p-4 rounded text-white ${
          result.isCompliant
            ? 'bg-green-600'
            : 'bg-red-600'
        }`}
      >
        <h2 className="text-xl font-bold">
          {result.isCompliant ? '✓ COMPLIANT' : '✗ NOT COMPLIANT'}
        </h2>
        <p>Applied {result.appliedRules} rules</p>
      </div>

      {/* Errors */}
      {result.errors.length > 0 && (
        <section>
          <h3 className="font-bold text-red-600">Errors</h3>
          <ul className="space-y-2">
            {result.errors.map((error, i) => (
              <li key={i} className="text-red-700">
                • {error}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <section>
          <h3 className="font-bold text-yellow-600">Warnings</h3>
          <ul className="space-y-2">
            {result.warnings.map((warning, i) => (
              <li key={i} className="text-yellow-700">
                • {warning}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
```

---

## Testing

### Unit Tests for Dynamic Rules

```typescript
// libs/ttb-rules/src/fetcher/ttb-storage.spec.ts
import { TTBRulesStorage } from './ttb-storage';

describe('TTBRulesStorage', () => {
  let storage: TTBRulesStorage;

  beforeEach(() => {
    storage = new TTBRulesStorage();
  });

  it('should load all rules', () => {
    const rules = storage.loadAllRules();
    expect(rules.length).toBeGreaterThan(0);
  });

  it('should load rules by category', () => {
    const required = storage.loadRulesByCategory('required');
    expect(required.length).toBeGreaterThan(0);
    expect(required.every((r) => r.category === 'required')).toBe(true);
  });

  it('should load rules by beverage type', () => {
    const beerRules = storage.loadRulesByBeverageType('beer');
    expect(beerRules.every((r) => r.applicableTo.includes('beer'))).toBe(true);
  });

  it('should search rules by keyword', () => {
    const results = storage.searchRules('brand');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should get rule by ID', () => {
    const rule = storage.loadRuleById('brand-name-required');
    expect(rule).toBeDefined();
    expect(rule?.category).toBe('required');
  });

  it('should export to CSV', () => {
    const csv = storage.exportToCSV();
    expect(csv).toContain('ID');
    expect(csv).toContain('brand-name-required');
  });
});
```

### Integration Tests

```typescript
// apps/api/test/rules.integration.spec.ts
import { Test } from '@nestjs/testing';
import { RulesController } from '../src/app/modules/rules/rules.controller';
import { RulesService } from '../src/app/modules/rules/rules.service';

describe('Rules API Integration', () => {
  let controller: RulesController;
  let service: RulesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [RulesController],
      providers: [RulesService],
    }).compile();

    controller = module.get(RulesController);
    service = module.get(RulesService);
  });

  it('should return all rules', () => {
    const rules = controller.getAllRules();
    expect(Array.isArray(rules)).toBe(true);
    expect(rules.length).toBeGreaterThan(0);
  });

  it('should return rules by category', () => {
    const required = controller.getAllRules('required');
    expect(required.every((r) => r.category === 'required')).toBe(true);
  });

  it('should return statistics', () => {
    const stats = controller.getStatistics();
    expect(stats.totalRules).toBeGreaterThan(0);
    expect(stats.byCategory).toBeDefined();
  });
});
```

---

## Deployment

### Docker Integration

Update `Dockerfile` to include rule fetching:

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY . .

# Install dependencies
RUN npm ci

# Fetch TTB rules
RUN npm run fetch:ttb-rules

# Build application
RUN npm run build

# Final image
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/libs/ttb-rules/data/rules ./libs/ttb-rules/data/rules
COPY --from=builder /app/.ttb-cache ./.ttb-cache

EXPOSE 3001
CMD ["node", "dist/apps/api/main.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      TTB_RULES_DIR: /app/libs/ttb-rules/data/rules
    ports:
      - '3001:3001'
    volumes:
      - ./libs/ttb-rules/data/rules:/app/libs/ttb-rules/data/rules

  # Task: Update rules weekly
  rules-updater:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - .:/app
    command: 'npm run fetch:ttb-rules'
    # Uses cron to run weekly
```

### CI/CD Pipeline

Add to `.github/workflows/deploy.yml`:

```yaml
- name: Fetch TTB Rules
  run: npm run fetch:ttb-rules

- name: Verify Rules
  run: npm run fetch:ttb-rules:stats

- name: Commit Rule Updates
  if: always()
  uses: stefanzweifel/git-auto-commit-action@v4
  with:
    commit_message: 'chore: update TTB rules'
    file_pattern: 'libs/ttb-rules/data/rules/'
```

### Scheduled Updates

Create a GitHub Actions workflow to update rules weekly:

```yaml
# .github/workflows/update-ttb-rules.yml
name: Update TTB Rules

on:
  schedule:
    # Every Sunday at 2 AM UTC
    - cron: '0 2 * * 0'

jobs:
  update-rules:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - run: npm ci

      - run: npm run fetch:ttb-rules

      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: 'chore: update TTB rules via scheduled fetch'
          file_pattern: 'libs/ttb-rules/data/rules/'
```

---

## Monitoring & Maintenance

### Regular Updates

```bash
# Update rules weekly
npm run fetch:ttb-rules

# Check update status
npm run fetch:ttb-rules:stats
```

### Health Check Endpoint

```typescript
@Get('/health/rules')
async checkRulesHealth() {
  const stats = this.rulesService.getStatistics();

  return {
    status: stats.totalRules > 0 ? 'healthy' : 'unhealthy',
    totalRules: stats.totalRules,
    lastUpdated: stats.lastUpdated,
  };
}
```

---

## Summary

Key integration points:

1. ✅ Fetch rules: `npm run fetch:ttb-rules`
2. ✅ Load in service: `TTBRulesStorage`
3. ✅ Expose via API: RulesController
4. ✅ Use in validation: ValidationService
5. ✅ Display to users: Frontend components
6. ✅ Maintain via CI/CD: Scheduled updates

The system is now fully integrated and ready for production!
