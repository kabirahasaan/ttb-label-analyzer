---
title: Development Testing
layout: default
parent: Testing Guide
nav_order: 1
---

# Development Testing Guide

Run and write tests in your local development environment with live reload and debugging.

## Prerequisites

- Development environment set up ([see setup guide](../quick-start/01-dev-setup.html))
- API running on `localhost:3001`
- Tests pass: `pnpm test --listTests`

## Running Tests in Development

### Watch Mode (Recommended)

```bash
# Watch all tests, rerun on file change
pnpm test --watch

# Output:
# Watch mode enabled. Press 'a' to run all tests or 'q' to quit.
# 
# PASS libs/validation-engine/src/services/validation.service.spec.ts (2.3s)
#   ValidationService
#     ✓ should validate label against rules (1200ms)
#     ✓ should mark missing warnings as error (45ms)
```

### Run Specific Test Suite

```bash
# Test validation engine only
pnpm test --testPathPattern="validation-engine"

# Test TTB rules
pnpm test --testPathPattern="ttb-rules"

# Test specific file
pnpm test src/services/validation.service.spec.ts

# Test files matching pattern
pnpm test --testNamePattern="should validate"
```

### Run with Coverage

```bash
# Generate coverage report
pnpm test:coverage

# View HTML report
open coverage/index.html

# Expected output:
# ----------|----------|----------|----------|----------|-----------|
# File      |  % Stmts | % Branch | % Funcs  | % Lines  | Uncovered |
# ----------|----------|----------|----------|----------|-----------|
# All files |     88.2 |     85.1 |     90.3 |     88.5 |           |
```

## Development Test Workflow

### 1. Write New Feature

Create `validation.service.ts`:
```typescript
export class ValidationService {
  validateRules(label: LabelData): ValidationResult {
    // Your implementation
  }
}
```

### 2. Write Test File

Create `validation.service.spec.ts` in same directory:
```typescript
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    service = new ValidationService();
  });

  it('should validate label against rules', () => {
    const label = { brandName: 'Test', abv: 5.5 };
    const result = service.validateRules(label);
    expect(result.status).toBe('valid');
  });
});
```

### 3. Run in Watch Mode

```bash
# Terminal 1: API server
pnpm nx run api:serve

# Terminal 2: Web app
pnpm nx run web:serve

# Terminal 3: Tests in watch mode
pnpm test --watch

# Now edit your files and watch tests rerun automatically
```

### 4. Debug Test Failures

When a test fails, you'll see:
```
❌ FAIL libs/validation-engine/src/services/validation.service.spec.ts
  ValidationService
    ✗ should validate label against rules
    
    Expected: valid
    Received: error
    
    at Object.<anonymous> (validation.service.spec.ts:42:5)
```

**How to fix:**
1. Read the error message carefully
2. Check the actual vs expected values
3. Update either test or implementation
4. File auto-reloads and test reruns

## Test Organization

### Unit Tests (Fast)

Test a single function:
```typescript
describe('isValidABV', () => {
  it('should accept ABV between 0 and 100', () => {
    expect(isValidABV(5.5)).toBe(true);
    expect(isValidABV(0)).toBe(true);
    expect(isValidABV(100)).toBe(true);
  });

  it('should reject invalid ABV', () => {
    expect(isValidABV(-1)).toBe(false);
    expect(isValidABV(101)).toBe(false);
    expect(isValidABV(NaN)).toBe(false);
  });
});
```

**Location**: Place `.spec.ts` file next to implementation  
**Runtime**: <100ms

### Integration Tests

Test module interactions:
```typescript
describe('LabelValidationWorkflow', () => {
  let validationService: ValidationService;
  let colaService: ColaService;

  beforeEach(() => {
    // Setup both services
    validationService = new ValidationService();
    colaService = new ColaService();
  });

  it('should validate label against COLA application', async () => {
    const label = await parseLabel(imageFile);
    const app = await colaService.getApplication('COLA-2024-001');
    const result = validationService.validateAgainstApp(label, app);
    expect(result.status).toBe('valid');
  });
});
```

**Location**: `test/` folders within each module  
**Runtime**: 100ms-1s

### E2E Tests (Full Workflow)

Test complete user journey:
```typescript
test('user should be able to upload and validate label', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:3000');
  
  // Upload image
  const inputFile = page.locator('input[type=file]');
  await inputFile.setInputFiles('test-images/label.jpg');
  
  // Check results
  const status = page.locator('.validation-status');
  await expect(status).toContainText('Valid');
});
```

**Location**: `e2e/` folder  
**Runtime**: 30s-2m (requires live API and web app)

## Testing Different Modules

### Testing Validation Engine

```bash
# Watch validation tests
pnpm test --testPathPattern="validation-engine" --watch

# With coverage
pnpm test --testPathPattern="validation-engine" --coverage
```

Key tests location: `libs/validation-engine/src/**/*.spec.ts`

### Testing TTB Rules

```bash
# Test TTB rules
pnpm test --testPathPattern="ttb-rules" --watch
```

Test different rule types:
- Government warning validation
- ABV range checking
- COLA number format
- Producer information requirements

### Testing Label Parser

```bash
# Test OCR and parsing
pnpm test --testPathPattern="label-parser" --watch
```

Tests verify:
- Text extraction from images
- Data normalization
- Format parsing (12 oz, 750ml, etc.)

### Testing API Endpoints

```bash
# Test API handlers
pnpm test --testPathPattern="apps/api" --watch

# Then test endpoint with curl
curl http://localhost:3001/applications | jq '.'
```

## Debugging Tests

### Add Console Logs

```typescript
it('should validate label', () => {
  const label = { brandName: 'Test' };
  console.log('Input:', label);  // <- Add this
  
  const result = validate(label);
  console.log('Result:', result);  // <- And this
  
  expect(result.status).toBe('valid');
});
```

**View logs in test output:**
```bash
pnpm test --watch

# Logs appear above test result
```

### Use Jest Debugger

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Then open chrome://inspect in browser
# Click "inspect" to debug
```

### Add Breakpoints (VSCode)

1. Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-coverage"],
      "console": "integratedTerminal"
    }
  ]
}
```

2. Set breakpoint in test file (click left margin)
3. Press F5 to start debugging
4. Execution pauses at breakpoint

## Common Testing Patterns

### Testing API Endpoints

```typescript
describe('Applications API', () => {
  it('should list all applications', async () => {
    const response = await request(app.getHttpServer())
      .get('/applications')
      .expect(200);
    
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
```

### Testing Database Queries

```typescript
describe('ApplicationService', () => {
  let service: ApplicationService;
  let db: Database;

  beforeEach(() => {
    db = new Database(':memory:');  // Use in-memory DB for tests
    service = new ApplicationService(db);
  });

  it('should create application', async () => {
    const app = await service.create({
      brandName: 'Test Brand',
      abv: 5.5
    });
    expect(app.id).toBeDefined();
  });
});
```

### Testing async Operations

```typescript
describe('Label Validation', () => {
  it('should validate label asynchronously', async () => {
    const result = await validateLabel(imageBuffer);
    expect(result).toEqual(expectedResult);
  });

  it('should handle validation errors', async () => {
    await expect(validateLabel(invalidBuffer))
      .rejects
      .toThrow('Invalid image');
  });
});
```

## Performance Testing

### Run Slow Tests First

```bash
# Show slowest 10 tests
pnpm test --listTests --detectOpenHandles

# Identify slow suites
pnpm test --testTimeout=5000 --verbose
```

### Measure Function Performance

```typescript
it('should validate label in <500ms', async () => {
  const start = performance.now();
  const result = await validateLabel(largeImage);
  const duration = performance.now() - start;
  
  expect(duration).toBeLessThan(500);
});
```

## Continuous Testing

### Run Tests on File Change

```bash
# Already in watch mode
pnpm test --watch

# Tests auto-rerun when you save files
```

### Run All Tests Before Commit

```bash
# Install husky hooks (one time)
pnpm install --save-dev husky
npx husky install

# Now tests run automatically before commit
# If tests fail, commit is blocked
```

## Test Reports

### Generate HTML Report

```bash
# Run tests with coverage
pnpm test:coverage

# Generate HTML
pnpm test:coverage -- --reporters=html

# Open in browser
open coverage/lcov-report/index.html
```

### View Coverage by File

```bash
# Show files with lowest coverage
pnpm test:coverage -- --thresholds=80

# Files below 80% coverage are highlighted
```

## Troubleshooting Test Issues

### Tests Won't Run

**Error**: "Cannot find module '@ttb/validation-engine'"
```bash
# Reinstall dependencies
pnpm install

# Link workspace packages
pnpm link -r
```

### Port Already in Use

**Error**: "EADDRINUSE: address already in use :::3001"
```bash
# Kill existing process
lsof -ti:3001 | xargs kill -9

# Restart tests
pnpm test:e2e
```

### Database Lock

**Error**: "database is locked"
```bash
# Reset test database
rm -rf test.db
pnpm test --runInBand
```

### Timeout Errors

**Error**: "Jest timeout exceeded"
```typescript
// Increase timeout for slow tests
jest.setTimeout(10000);

it('slow test', async () => {
  // Takes longer than 5s
});
```

## Next Steps

1. **[Production Testing](./02-testing-prod.html)** - Test deployment
2. **[Test Coverage](./03-test-coverage.html)** - Dev vs prod coverage analysis
3. **[Test Data](../test-data/)** - Sample data guide

---

## Development Test Coverage Summary

Current development test coverage: **88%**

| Test Type | Count | Coverage | Status |
|-----------|-------|----------|--------|
| Unit Tests | 15+ | 88% | ✅ PASS |
| Integration Tests | 12+ | 81% | ✅ PASS |
| E2E Tests | 28 | 100% workflows | ✅ PASS |

**Total**: 55+ tests running in ~2 minutes

For detailed coverage breakdown and comparison with production testing, see:

[**Test Coverage Report →**](./03-test-coverage.html)

---

**Back**: [Testing Guide →](./)
