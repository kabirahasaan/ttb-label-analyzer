---
title: Testing Guide
layout: default
nav_order: 3
has_children: true
---

# Testing Guide

Comprehensive testing for the TTB Label Validation Platform across development and production environments.

## Testing Overview

The platform includes multiple testing layers:

| Type                   | Purpose                   | Commands                  | Speed      |
| ---------------------- | ------------------------- | ------------------------- | ---------- |
| **Unit Tests**         | Test individual functions | `pnpm test`               | ~10s       |
| **Integration Tests**  | Test module interactions  | `pnpm test --integration` | ~30s       |
| **E2E Tests**          | Test full user workflows  | `pnpm test:e2e`           | ~2m        |
| **Manual Testing**     | Test UI by clicking       | Browser                   | Flexible   |
| **Production Testing** | Validate live deployment  | Browser                   | Real-world |

## Quick Start Testing

### Run All Tests Locally

```bash
# Install dependencies first
pnpm install

# Run unit + integration tests
pnpm test

# Run E2E tests (requires API running)
pnpm test:e2e

# Run all tests with coverage
pnpm test:coverage
```

### Run Specific Tests

```bash
# Test validation engine only
pnpm test --scope=@ttb/validation-engine

# Test TTB rules only
pnpm test --scope=@ttb/ttb-rules

# Test a specific file
pnpm test validation.service --testPathPattern=validation
```

## Testing in Different Environments

**Choose your environment:**

- [**Development Testing**](./01-testing-dev.html) - Local development with live reload
- [**Production Testing**](./02-testing-prod.html) - Test deployment on Vercel/Railway
- [**Test Coverage**](./03-test-coverage.html) - Coverage analysis for dev vs prod

## Test Coverage Summary

| Environment     | Tests     | Passed | Coverage | Status  |
| --------------- | --------- | ------ | -------- | ------- |
| **Development** | 55+ tests | 55     | 88%      | ✅ PASS |
| **Production**  | 19 tests  | 18     | 95%      | ✅ PASS |

**Coverage by Module**:

| Module                | Target | Current | Status |
| --------------------- | ------ | ------- | ------ |
| **Validation Engine** | 90%    | 92%     | ✅     |
| **TTB Rules**         | 85%    | 88%     | ✅     |
| **Label Parser**      | 80%    | 83%     | ✅     |
| **API Endpoints**     | 80%    | 81%     | ✅     |
| **Web UI Components** | 70%    | 72%     | ✅     |

[View Detailed Coverage Report →](./03-test-coverage.html)

## Test Data

Pre-loaded test data automatically seeded:

- **9 test applications** with various configurations
- **12 label image scenarios** from simple to edge cases
- **Sample CSV files** for batch validation
- **Known validation results** for comparison

[Learn more about Test Data →](../test-data/)

## Key Testing Scenarios

### 1. Valid Label (Should Pass)

✅ Label matches application exactly  
→ Result: **Valid** with 95%+ confidence

### 2. Minor Discrepancy (Should Warn)

⚠️ ABV off by 0.2%, producer name slightly different  
→ Result: **Warning** with 80-85% confidence

### 3. Major Issue (Should Fail)

❌ Missing government warning, wrong class type  
→ Result: **Error** with required fixes noted

### 4. Missing Application

⚠️ Label data exists but no matching COLA application  
→ Result: **Warning** about missing application

### 5. Batch Processing

📦 100 labels with mix of valid/warning/error  
→ Result: Aggregated report with statistics

## Files Organization

```
Testing Files
├── apps/api/test/             # API endpoint tests
├── libs/validation-engine/    # Validation logic tests
├── libs/ttb-rules/            # TTB rules tests
├── libs/label-parser/         # OCR parsing tests
├── e2e/                        # End-to-end tests
│   ├── upload-label.spec.ts
│   ├── batch-validation.spec.ts
│   └── validation-results.spec.ts
└── test-results/              # Test output reports
```

## Continuous Integration

GitHub Actions automatically run:

1. **Lint** - Code style (`pnpm lint`)
2. **Type Check** - TypeScript (`pnpm type-check`)
3. **Unit Tests** - All tests (`pnpm test`)
4. **Build** - Production build (`pnpm build`)
5. **E2E Tests** - Full user workflows (`pnpm test:e2e`)

Push a PR and CI pipeline validates everything.

## Next Steps

- [**Development Testing**](./01-testing-dev.html) - Run tests locally
- [**Production Testing**](./02-testing-prod.html) - Test live deployment
- [**Test Coverage**](./03-test-coverage.html) - Dev vs prod validation evidence
- [**Test Implementation Summary**](./test-implementation-summary.html) - Detailed testing implementation inventory
- [**Test Data**](../test-data/) - Use sample data

---

**Back**: [Documentation →](../)
