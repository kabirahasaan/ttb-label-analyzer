# TTB Label Analyzer - Testing Guide

This document provides comprehensive information about testing in the TTB Label Analyzer project.

## Table of Contents

- [Overview](#overview)
- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Coverage Reports](#coverage-reports)
- [CI/CD Integration](#cicd-integration)

## Overview

The project uses a comprehensive testing strategy that includes:

- **Unit Tests**: Testing individual components, utilities, and functions
- **Integration Tests**: Testing API endpoints and service integrations
- **E2E Tests**: Testing complete user flows across the application

## Test Types

### Unit Tests

Unit tests are implemented using Jest and React Testing Library for the web app, and Jest with NestJS Testing utilities for the API.

**Locations**:

- Web: `apps/web/src/**/__tests__/**/*.test.{ts,tsx}`
- API: `apps/api/src/**/*.spec.ts`

**Run**:

```bash
npm run test:unit
npm run test:unit:watch  # Watch mode
```

### Integration Tests

Integration tests verify API endpoints using supertest.

**Location**: `apps/api/test/**/*.e2e-spec.ts`

**Run**:

```bash
npm run test:integration
```

### E2E Tests

End-to-end tests use Playwright to test complete user workflows.

**Location**: `e2e/**/*.spec.ts`

**Run**:

```bash
npm run test:e2e                # All browsers
npm run test:e2e:chromium       # Chromium only
npm run test:e2e:headed         # With browser UI
npm run test:e2e:ui             # Interactive UI mode
```

## Running Tests

### All Tests

Run all test suites (unit, integration, and E2E):

```bash
npm test
```

### Individual Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e
```

### Watch Mode

```bash
# Unit tests in watch mode
npm run test:watch
npm run test:unit:watch
```

### With Coverage

```bash
# All tests with coverage
npm run test:coverage

# Unit tests coverage only
npm run test:coverage:unit

# Integration tests coverage only
npm run test:coverage:integration

# View coverage report summary
npm run test:coverage:report
```

## Test Structure

### Web App Unit Tests

```typescript
// apps/web/src/lib/__tests__/file.test.ts
import { downloadJson } from '../file';

describe('File Utilities', () => {
  it('should download JSON file', () => {
    const data = { test: 'data' };
    downloadJson(data, 'test.json');
    // Assertions...
  });
});
```

### API Unit Tests

```typescript
// apps/api/src/modules/health/health.controller.spec.ts
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get(HealthController);
  });

  it('should return health status', () => {
    const result = controller.check();
    expect(result.status).toBe('ok');
  });
});
```

### API Integration Tests

```typescript
// apps/api/test/application.e2e-spec.ts
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';

describe('Application API (e2e)', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/applications (POST)', () => {
    return request(app.getHttpServer())
      .post('/applications')
      .send({ brandName: 'Test' })
      .expect(201);
  });
});
```

### Playwright E2E Tests

```typescript
// e2e/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('TTB Label');
  });
});
```

## Writing Tests

### Best Practices

1. **Describe blocks**: Use descriptive names for test suites
2. **Single responsibility**: Each test should verify one behavior
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mock external dependencies**: Isolate the code under test
5. **Clean up**: Reset state between tests

### Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render with props', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Testing Utilities

```typescript
describe('utility function', () => {
  it('should transform input correctly', () => {
    const result = myUtility('input');
    expect(result).toBe('expected output');
  });
});
```

### Testing API Endpoints

```typescript
describe('/endpoint', () => {
  it('should return 200 with valid data', () => {
    return request(app.getHttpServer())
      .get('/endpoint')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
      });
  });
});
```

## Coverage Reports

### Viewing Coverage

After running tests with coverage, view reports:

**HTML Reports**:

- Unit: `coverage/unit/lcov-report/index.html`
- Integration: `coverage/integration/lcov-report/index.html`
- Playwright: Run `npx playwright show-report`

**Terminal Summary**:

```bash
npm run test:coverage:report
```

### Coverage Thresholds

Minimum coverage requirements:

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

Tests will fail if coverage drops below these thresholds.

## CI/CD Integration

### Test Execution in CI

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

### Artifacts

The following test artifacts are generated:

- **Coverage**: `coverage/` directory (LCOV, JSON, HTML)
- **Playwright Results**: `test-results/` and `playwright-report/`
- **JUnit XML**: For CI test reporting

## Debugging Tests

### Debug Unit Tests

```bash
# Run specific test file
npx jest path/to/test.spec.ts

# Run tests matching pattern
npx jest --testNamePattern="should do something"

# Run with verbose output
npx jest --verbose
```

### Debug E2E Tests

```bash
# Run with UI for debugging
npm run test:e2e:ui

# Run headed (see browser)
npm run test:e2e:headed

# Debug specific test
npx playwright test e2e/homepage.spec.ts --debug
```

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout in test configuration
2. **Flaky E2E tests**: Add explicit waits and assertions
3. **Coverage not generating**: Ensure `--coverage` flag is used
4. **Import errors**: Check module name mapping in jest.config

### Getting Help

- Check test logs for error messages
- Review test configuration files
- Ensure all dependencies are installed: `npm install`
- Clear cache: `npx jest --clearCache` or `npx playwright install`

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
