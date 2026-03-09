---
title: Testing (Legacy)
layout: default
permalink: /testing-legacy
---

# Testing Guide

Comprehensive testing strategy for the TTB Label Compliance Validation Platform. This guide covers unit tests, integration tests, E2E tests, and best practices.

**Target Coverage**: 70%+  
**Test Runners**: Jest (unit/integration), Playwright (E2E)  
**CI/CD Integration**: GitHub Actions ready

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Structure](#test-structure)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [E2E Tests](#e2e-tests)
6. [Coverage Expectations](#coverage-expectations)
7. [Running Tests](#running-tests)
8. [Test Data](#test-data)
9. [Best Practices](#best-practices)
10. [Debugging Tests](#debugging-tests)
11. [CI/CD Integration](#cicd-integration)

---

## Testing Philosophy

Our testing approach balances comprehensiveness with practicality:

- ✅ **Type Safety First**: TypeScript prevents entire classes of bugs
- ✅ **Test Behavior, Not Implementation**: Focus on what the code does, not how
- ✅ **Positive & Negative Cases**: Test both success and failure paths
- ✅ **Isolation**: Each test is independent and can run in any order
- ✅ **Fast Feedback**: Tests should complete in seconds
- ✅ **Maintainability**: Test code is product code (same standards apply)
- ✅ **Coverage Target**: 70%+ coverage for critical paths

### Testing Pyramid

```
         ⚡ E2E (Playwright)
        /   \ ~10-20% of tests
       /     \ (Slower, comprehensive)
      /-------\
     /  Integration Tests  \
    /    Jest    ~30-40% of tests  \
   /            (Medium speed, critical paths)\
  /----------------------------------\
 /        Unit Tests (Jest)           \
/     ~50-60% of tests                 \
 (Fast, isolated components)
```

---

## Test Structure

```
ttb-label-analyzer/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── modules/
│   │   │   │   │   └── label/
│   │   │   │   │       ├── label.service.ts
│   │   │   │   │       ├── label.controller.ts
│   │   │   │   │       ├── label.service.spec.ts      # Unit test
│   │   │   │   │       └── label.controller.spec.ts   # Unit test
│   │   │   │   └── app.module.ts
│   │   │   └── main.ts
│   │   ├── test/
│   │   │   ├── label.integration.spec.ts              # Integration test
│   │   │   ├── validation.integration.spec.ts         # Integration test
│   │   │   ├── fixtures/                              # Test data
│   │   │   │   ├── labels.json
│   │   │   │   └── applications.json
│   │   │   └── setup.ts                               # Test configuration
│   │   ├── jest.config.ts                             # Jest configuration
│   │   └── package.json
│   │
│   └── web/
│       ├── src/
│       │   └── components/
│       │       └── upload-label/
│       │           ├── upload-label.tsx
│       │           └── upload-label.test.tsx           # Component test
│       ├── e2e/
│       │   ├── upload-label.spec.ts                    # E2E test
│       │   ├── batch-validation.spec.ts               # E2E test
│       │   └── fixtures/
│       │       ├── label-images/
│       │       └── test-data.ts
│       └── playwright.config.ts
│
└── libs/
    ├── validation-engine/
    │   └── src/
    │       ├── validation.engine.ts
    │       └── validation.engine.spec.ts               # Unit test
    └── @ttb/test-data-generator/
        └── src/
            ├── test-data.generator.ts
            └── test-data.generator.spec.ts             # Unit test
```

---

## Unit Tests

Unit tests verify individual functions and classes in isolation.

### Label Service Unit Tests

**File**: `apps/api/src/app/modules/label/label.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { LabelService } from './label.service';
import { LoggerService } from '@ttb/logger';
import { CreateLabelDto } from './label.dto';

describe('LabelService', () => {
  let service: LabelService;
  let logger: LoggerService;

  // Setup
  beforeEach(async () => {
    logger = new LoggerService({ level: 'info' });
    service = new LabelService(logger);
  });

  // Test 1: Happy path - create valid label
  describe('create', () => {
    it('should create and return a label with valid data', () => {
      const createDto: CreateLabelDto = {
        brandName: 'Premium Ale',
        alcoholByVolume: 5.5,
        netContents: '12 fl oz',
        governmentWarning: 'WARNING: Government warning...',
        classType: 'beer',
        producerName: 'Brewery Inc',
      };

      const result = service.create(createDto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.brandName).toBe('Premium Ale');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    // Test 2: Error path - reject empty brand name
    it('should throw BadRequestException for empty brand name', () => {
      const invalidDto = {
        brandName: '', // Empty!
        alcoholByVolume: 5.5,
        netContents: '12 fl oz',
        governmentWarning: 'WARNING: ...',
        classType: 'beer',
        producerName: 'Brewery Inc',
      };

      expect(() => service.create(invalidDto)).toThrow('Brand name required');
    });

    // Test 3: Error path - reject invalid ABV
    it('should throw BadRequestException for ABV > 100', () => {
      const invalidDto: CreateLabelDto = {
        brandName: 'Test',
        alcoholByVolume: 150, // Invalid: > 100%
        netContents: '12 fl oz',
        governmentWarning: 'WARNING: ...',
        classType: 'beer',
        producerName: 'Brewery Inc',
      };

      expect(() => service.create(invalidDto)).toThrow('ABV must be 0-100%');
    });

    // Test 4: Edge case - minimum valid values
    it('should accept ABV of 0.0%', () => {
      const dto: CreateLabelDto = {
        brandName: 'Non-Alcoholic Beer',
        alcoholByVolume: 0.0,
        netContents: '12 fl oz',
        governmentWarning: 'Contains no alcohol',
        classType: 'beer',
        producerName: 'Brewery Inc',
      };

      const result = service.create(dto);
      expect(result.alcoholByVolume).toBe(0.0);
    });

    // Test 5: Edge case - maximum valid values
    it('should accept ABV of exactly 100%', () => {
      const dto: CreateLabelDto = {
        brandName: 'High Proof Spirit',
        alcoholByVolume: 100.0,
        netContents: '1.75 L',
        governmentWarning: 'WARNING: ...',
        classType: 'spirits',
        producerName: 'Distillery Inc',
      };

      const result = service.create(dto);
      expect(result.alcoholByVolume).toBe(100.0);
    });
  });

  // Test 6: Read operations
  describe('findOne', () => {
    it('should return label by ID', () => {
      // Arrange: Create a label first
      const created = service.create({
        brandName: 'Test Beer',
        alcoholByVolume: 5.5,
        netContents: '12 fl oz',
        governmentWarning: 'WARNING: ...',
        classType: 'beer',
        producerName: 'Brewery',
      });

      // Act: Find it
      const found = service.findOne(created.id!);

      // Assert: Should match
      expect(found).toEqual(created);
    });

    it('should throw NotFoundException for non-existent label', () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      expect(() => service.findOne(fakeId)).toThrow('Label not found');
    });
  });

  // Test 7: List operations
  describe('findAll', () => {
    it('should return all labels', () => {
      // Arrange: Create multiple labels
      service.create({ ...validDto, brandName: 'Beer 1' });
      service.create({ ...validDto, brandName: 'Beer 2' });
      service.create({ ...validDto, brandName: 'Beer 3' });

      // Act: Get all
      const all = service.findAll();

      // Assert: All returned
      expect(all).toHaveLength(3);
    });

    it('should return empty array when no labels exist', () => {
      const all = service.findAll();
      expect(all).toEqual([]);
    });
  });

  // Test 8: Update operations
  describe('update', () => {
    it('should update label properties', () => {
      const created = service.create({ ...validDto });

      const updated = service.update(created.id!, {
        brandName: 'Updated Brand',
      });

      expect(updated.brandName).toBe('Updated Brand');
    });
  });

  // Test 9: Delete operations
  describe('delete', () => {
    it('should delete label by ID', () => {
      const created = service.create({ ...validDto });

      service.delete(created.id!);

      expect(() => service.findOne(created.id!)).toThrow();
    });
  });

  // Test 10: Logging
  describe('logging', () => {
    it('should log when creating label', () => {
      const spyLog = jest.spyOn(logger, 'info');

      service.create({ ...validDto });

      expect(spyLog).toHaveBeenCalledWith(
        expect.stringContaining('Creating label'),
        expect.any(Object)
      );
    });
  });
});

// Helper: Valid DTO for reuse
const validDto: CreateLabelDto = {
  brandName: 'Test Brand',
  alcoholByVolume: 5.5,
  netContents: '12 fl oz',
  governmentWarning: 'WARNING: Government warning',
  classType: 'beer',
  producerName: 'Brewery Inc',
};
```

### Validation Engine Unit Tests

**File**: `libs/validation-engine/src/validation.engine.spec.ts`

```typescript
import { ValidationEngine } from './validation.engine';
import { LabelData, ValidationStatus } from '@ttb/shared-types';

describe('ValidationEngine', () => {
  let engine: ValidationEngine;

  beforeEach(() => {
    engine = new ValidationEngine();
  });

  describe('validateLabel', () => {
    // Test 1: All rules pass
    it('should return COMPLIANT for valid label', () => {
      const validLabel: LabelData = {
        brandName: 'Compliant Brand',
        alcoholByVolume: 5.5,
        netContents: '12 fl oz (355 mL)',
        governmentWarning: 'WARNING: Government warning text here',
        classType: 'beer',
        producerName: 'Brewery Inc',
      };

      const result = engine.validateLabel(validLabel);

      expect(result.isCompliant).toBe(true);
      expect(result.status).toBe(ValidationStatus.COMPLETED);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    // Test 2: Missing brand name rule violation
    it('should fail validation with empty brand name', () => {
      const label: LabelData = {
        brandName: '', // VIOLATION: Required field
        alcoholByVolume: 5.5,
        netContents: '12 fl oz',
        governmentWarning: 'WARNING: ...',
        classType: 'beer',
        producerName: 'Brewery',
      };

      const result = engine.validateLabel(label);

      expect(result.isCompliant).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe('BRAND_NAME_REQUIRED');
    });

    // Test 3: Invalid ABV rule violation
    it('should fail with ABV outside valid range (0-100%)', () => {
      const label: LabelData = {
        ...validLabel,
        alcoholByVolume: 150, // VIOLATION: > 100%
      };

      const result = engine.validateLabel(label);

      expect(result.isCompliant).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({ code: 'ABV_OUT_OF_RANGE' }));
    });

    // Test 4: Missing government warning
    it('should fail without government warning', () => {
      const label: LabelData = {
        ...validLabel,
        governmentWarning: '', // VIOLATION: Required
      };

      const result = engine.validateLabel(label);

      expect(result.isCompliant).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: 'GOVERNMENT_WARNING_REQUIRED' })
      );
    });

    // Test 5: Invalid class type
    it('should fail with invalid class type', () => {
      const label: LabelData = {
        ...validLabel,
        classType: 'invalid-type', // VIOLATION: Not in enum
      };

      const result = engine.validateLabel(label);

      expect(result.isCompliant).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({ code: 'INVALID_CLASS_TYPE' }));
    });

    // Test 6: Multiple rule violations
    it('should report all violations at once', () => {
      const label: LabelData = {
        brandName: '', // VIOLATION 1
        alcoholByVolume: 150, // VIOLATION 2
        netContents: '12 fl oz',
        governmentWarning: '', // VIOLATION 3
        classType: 'invalid', // VIOLATION 4
        producerName: '', // VIOLATION 5
      };

      const result = engine.validateLabel(label);

      expect(result.isCompliant).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(5);
    });

    // Test 7: Warning flag (passes but with warnings)
    it('should return WARNING status for valid but unusual label', () => {
      const label: LabelData = {
        ...validLabel,
        alcoholByVolume: 0.1, // Very low ABV - warning but valid
      };

      const result = engine.validateLabel(label);

      expect(result.isCompliant).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    // Test 8: Edge case - minimum valid ABV
    it('should accept ABV of 0.0%', () => {
      const label: LabelData = {
        ...validLabel,
        alcoholByVolume: 0.0,
      };

      const result = engine.validateLabel(label);

      expect(result.isCompliant).toBe(true);
    });

    // Test 9: Edge case - maximum valid ABV
    it('should accept ABV of 100%', () => {
      const label: LabelData = {
        ...validLabel,
        alcoholByVolume: 100,
        classType: 'spirits',
      };

      const result = engine.validateLabel(label);

      expect(result.isCompliant).toBe(true);
    });

    // Test 10: Long string handling
    it('should handle very long brand names', () => {
      const label: LabelData = {
        ...validLabel,
        brandName: 'A'.repeat(500), // Very long
      };

      const result = engine.validateLabel(label);

      // Should either pass or fail gracefully
      expect(result.status).toBe(ValidationStatus.COMPLETED);
    });
  });
});

// Helper
const validLabel: LabelData = {
  brandName: 'Valid Brand',
  alcoholByVolume: 5.5,
  netContents: '12 fl oz',
  governmentWarning: 'WARNING: ...',
  classType: 'beer',
  producerName: 'Brewery',
};
```

### Controller Unit Tests

**File**: `apps/api/src/app/modules/label/label.controller.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { LabelController } from './label.controller';
import { LabelService } from './label.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('LabelController', () => {
  let controller: LabelController;
  let service: LabelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabelController],
      providers: [
        {
          provide: LabelService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LabelController>(LabelController);
    service = module.get<LabelService>(LabelService);
  });

  describe('POST /labels', () => {
    it('should create label and return HTTP 201', async () => {
      const createDto = { ...validDto };
      const expectedResult = { id: '123', ...createDto };

      jest.spyOn(service, 'create').mockReturnValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('GET /labels', () => {
    it('should return array of labels', async () => {
      const expectedResult = [
        { id: '1', ...validDto },
        { id: '2', ...validDto },
      ];

      jest.spyOn(service, 'findAll').mockReturnValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /labels/:id', () => {
    it('should return specific label', async () => {
      const expectedResult = { id: '123', ...validDto };

      jest.spyOn(service, 'findOne').mockReturnValue(expectedResult);

      const result = await controller.findOne('123');

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException if label not found', async () => {
      jest.spyOn(service, 'findOne').mockImplementation(() => {
        throw new NotFoundException('Label not found');
      });

      await expect(controller.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});

const validDto = {
  brandName: 'Test Brand',
  alcoholByVolume: 5.5,
  netContents: '12 fl oz',
  governmentWarning: 'WARNING: ...',
  classType: 'beer',
  producerName: 'Brewery',
};
```

---

## Integration Tests

Integration tests verify the interaction between multiple components.

### Label Workflow Integration Test

**File**: `apps/api/test/label.integration.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app/app.module';
import { LabelService } from '../src/app/modules/label/label.service';
import { ValidationService } from '../src/app/modules/validation/validation.service';

describe('Label Workflow Integration', () => {
  let app: INestApplication;
  let labelService: LabelService;
  let validationService: ValidationService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    labelService = moduleFixture.get<LabelService>(LabelService);
    validationService = moduleFixture.get<ValidationService>(ValidationService);
  });

  afterAll(async () => {
    await app.close();
  });

  // Test 1: Complete label creation and validation flow
  it('should complete full label validation workflow', () => {
    // Step 1: Create a label
    const created = labelService.create({
      brandName: 'Integration Test Beer',
      alcoholByVolume: 5.5,
      netContents: '12 fl oz',
      governmentWarning: 'WARNING: ...',
      classType: 'beer',
      producerName: 'Test Brewery',
    });

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();

    // Step 2: Retrieve the label
    const retrieved = labelService.findOne(created.id!);

    expect(retrieved).toEqual(created);

    // Step 3: Validate the label
    const validation = validationService.validateLabel(retrieved);

    expect(validation).toBeDefined();
    expect(validation.labelId).toBe(created.id);
    expect(validation.isCompliant).toBe(true);

    // Step 4: Verify it's in the list
    const all = labelService.findAll();

    expect(all).toContainEqual(expect.objectContaining({ id: created.id }));
  });

  // Test 2: Invalid label creation and validation failure
  it('should handle invalid label gracefully', () => {
    // Create invalid label
    const created = labelService.create({
      brandName: '', // Invalid
      alcoholByVolume: 150, // Invalid
      netContents: '12 fl oz',
      governmentWarning: '', // Invalid
      classType: 'beer',
      producerName: 'Test Brewery',
    });

    // Validate - should have errors
    const validation = validationService.validateLabel(created);

    expect(validation.isCompliant).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  // Test 3: Cross-check between label and application
  it('should validate label against application', () => {
    const label = labelService.create({
      brandName: 'Premium Ale',
      alcoholByVolume: 6.2,
      netContents: '12 fl oz (355 mL)',
      governmentWarning: 'WARNING: ...',
      classType: 'beer',
      producerName: 'BrewCo',
    });

    const application = {
      brandName: 'Premium Ale',
      alcoholByVolume: 6.2,
      netContents: '12 fl oz (355 mL)',
      producerName: 'BrewCo',
    };

    const crossCheck = validationService.crossCheck(label, application);

    expect(crossCheck.match).toBe(true);
    expect(crossCheck.discrepancies).toHaveLength(0);
  });

  // Test 4: Batch operations
  it('should batch validate multiple labels', () => {
    const labels = [
      labelService.create({ ...validDto, brandName: 'Beer 1' }),
      labelService.create({ ...validDto, brandName: 'Beer 2' }),
      labelService.create({ ...validDto, brandName: 'Beer 3' }),
    ];

    const results = validationService.validateBatch(labels.map((l) => l.id!));

    expect(results.totalItems).toBe(3);
    expect(results.successCount).toBe(3);
  });
});

const validDto = {
  brandName: 'Valid Brand',
  alcoholByVolume: 5.5,
  netContents: '12 fl oz',
  governmentWarning: 'WARNING: ...',
  classType: 'beer',
  producerName: 'Brewery',
};
```

### API Endpoint Integration Test

**File**: `apps/api/test/labels.e2e.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';

describe('Labels API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /labels', () => {
    it('should create label with valid data', () => {
      return request(app.getHttpServer())
        .post('/labels')
        .send({
          brandName: 'E2E Test Beer',
          alcoholByVolume: 5.5,
          netContents: '12 fl oz',
          governmentWarning: 'WARNING: ...',
          classType: 'beer',
          producerName: 'Brewery',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.brandName).toBe('E2E Test Beer');
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/labels')
        .send({
          brandName: '', // Invalid: empty
          alcoholByVolume: 5.5,
          // Missing other required fields
        })
        .expect(400);
    });
  });

  describe('GET /labels', () => {
    it('should return array of labels', () => {
      return request(app.getHttpServer())
        .get('/labels')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
```

---

## E2E Tests

E2E (End-to-End) tests simulate real user workflows using Playwright.

### Label Upload Flow E2E Test

**File**: `apps/web/e2e/upload-label.spec.ts`

```typescript
import { test, expect, Page } from '@playwright/test';

test.describe('Label Upload Flow', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });

  test.afterEach(async () => {
    await page.close();
  });

  // Test 1: Happy path - successful label upload
  test('should upload label with all valid data', async () => {
    // Navigate to upload page
    await page.click('text=Upload Label');
    await page.waitForURL('**/upload-label');

    // Fill form fields
    await page.fill('input[name="brandName"]', 'Test Brewery IPA');
    await page.fill('input[name="alcoholByVolume"]', '6.5');
    await page.fill('input[name="netContents"]', '12 fl oz (355 mL)');
    await page.selectOption('select[name="classType"]', 'beer');
    await page.fill('textarea[name="governmentWarning"]', 'WARNING: Government warning text here');
    await page.fill('input[name="producerName"]', 'Brewery Inc');

    // Submit form
    await page.click('button[type="submit"]:has-text("Upload")');

    // Verify success
    await expect(page.locator('text=Label uploaded successfully')).toBeVisible();

    // Verify redirect to results
    await page.waitForURL('**/validation-results');
  });

  // Test 2: Field validation - missing required fields
  test('should show validation error for missing brand name', async () => {
    await page.goto('http://localhost:3000/upload-label');

    // Leave brand name empty
    await page.fill('input[name="alcoholByVolume"]', '5.5');
    await page.fill('input[name="netContents"]', '12 fl oz');

    // Submit
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=Brand name is required')).toBeVisible();

    // Form should NOT submit
    expect(page.url()).toContain('upload-label');
  });

  // Test 3: Field validation - invalid ABV
  test('should prevent ABV > 100%', async () => {
    await page.goto('http://localhost:3000/upload-label');

    await page.fill('input[name="alcoholByVolume"]', '150');
    await page.blur('input[name="alcoholByVolume"]');

    // Should show error
    await expect(page.locator('text=ABV must be between 0 and 100')).toBeVisible();
  });

  // Test 4: Image upload
  test('should upload label with image', async () => {
    await page.goto('http://localhost:3000/upload-label');

    // Fill required fields
    await page.fill('input[name="brandName"]', 'Imaged Brand');
    await page.fill('input[name="alcoholByVolume"]', '5.5');
    await page.fill('input[name="netContents"]', '12 fl oz');
    await page.selectOption('select[name="classType"]', 'beer');

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('test-data/label-image.jpg');

    // Verify file shows as selected
    await expect(page.locator('text=label-image.jpg')).toBeVisible({ timeout: 5000 });

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Label uploaded successfully')).toBeVisible();
  });

  // Test 5: Form persistence on error
  test('should preserve form data when validation fails', async () => {
    await page.goto('http://localhost:3000/upload-label');

    // Fill form
    const brandName = 'Persistent Brand';
    await page.fill('input[name="brandName"]', brandName);
    await page.fill(
      'input[name="alcoholByVolume"]',
      '150' // Invalid
    );
    await page.fill('input[name="netContents"]', '12 fl oz');

    // Submit (will fail)
    await page.click('button[type="submit"]');

    // Verify error shown
    await expect(page.locator('text=ABV must be between 0 and 100')).toBeVisible();

    // Verify form data preserved
    const brand = page.locator('input[name="brandName"]');
    await expect(brand).toHaveValue(brandName);
  });

  // Test 6: Real-time validation feedback
  test('should show validation feedback in real-time', async () => {
    await page.goto('http://localhost:3000/upload-label');

    const abvInput = page.locator('input[name="alcoholByVolume"]');

    // Type valid value
    await abvInput.fill('50');
    await expect(page.locator('.error')).not.toBeVisible();

    // Type invalid value
    await abvInput.fill('150');
    await page.waitForTimeout(500); // Wait for debounce
    await expect(page.locator('text=ABV must be between 0 and 100')).toBeVisible();

    // Fix value
    await abvInput.fill('65');
    await page.waitForTimeout(500);
    await expect(page.locator('.error')).not.toBeVisible();
  });

  // Test 7: Mobile responsiveness
  test('should work on mobile devices', async ({ browser }) => {
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      isMobile: true,
    });

    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:3000/upload-label');

    // Form should be visible and accessible
    await expect(mobilePage.locator('input[name="brandName"]')).toBeVisible();

    // Keyboard should work
    await mobilePage.fill('input[name="brandName"]', 'Mobile Test');
    await expect(mobilePage.locator('input[name="brandName"]')).toHaveValue('Mobile Test');

    await mobileContext.close();
  });

  // Test 8: Accessibility
  test('should be accessible via keyboard', async () => {
    await page.goto('http://localhost:3000/upload-label');

    // Tab through form
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="brandName"]')).toBeFocused();

    // Fill using keyboard
    await page.keyboard.type('Keyboard Test Brand');

    await page.keyboard.press('Tab');
    await page.keyboard.type('5.5');

    await page.keyboard.press('Tab');
    await page.keyboard.type('12 fl oz');

    // Verify fields filled
    await expect(page.locator('input[name="brandName"]')).toHaveValue('Keyboard Test Brand');
  });
});
```

### Batch Validation E2E Test

**File**: `apps/web/e2e/batch-validation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Batch Validation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/batch-validation');
  });

  // Test 1: Batch upload with multiple files
  test('should batch validate multiple label files', async ({ page }) => {
    // Drag and drop multiple files
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      'test-data/label1.jpg',
      'test-data/label2.jpg',
      'test-data/label3.jpg',
    ]);

    // Verify file count shows
    await expect(page.locator('text=3 files selected')).toBeVisible();

    // Submit batch
    await page.click('button:has-text("Validate Batch")');

    // Wait for processing
    await page.waitForURL('**/validation-results');

    // Verify results page shows
    await expect(page.locator('[data-testid="batch-results"]')).toBeVisible();

    // Verify all 3 results displayed
    const resultRows = page.locator('[data-testid="result-row"]');
    await expect(resultRows).toHaveCount(3);
  });

  // Test 2: Progress tracking
  test('should show progress during batch processing', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      'test-data/label1.jpg',
      'test-data/label2.jpg',
      'test-data/label3.jpg',
      'test-data/label4.jpg',
      'test-data/label5.jpg',
    ]);

    await page.click('button:has-text("Validate Batch")');

    // Progress bar should appear
    await expect(page.locator('[role="progressbar"]')).toBeVisible();

    // Progress should increase
    const progressStart = await page.locator('[role="progressbar"]').getAttribute('aria-valuenow');

    await page.waitForTimeout(1000);

    const progressEnd = await page.locator('[role="progressbar"]').getAttribute('aria-valuenow');

    expect(Number(progressEnd)).toBeGreaterThan(Number(progressStart));
  });

  // Test 3: Results export
  test('should export batch results as CSV', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(['test-data/label1.jpg', 'test-data/label2.jpg']);

    await page.click('button:has-text("Validate Batch")');
    await page.waitForURL('**/validation-results');

    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export CSV")');
    const download = await downloadPromise;

    // Verify file
    expect(download.suggestedFilename()).toMatch(/batch-results-\d+.csv/);
  });

  // Test 4: Error handling on large batch
  test('should handle large batch requests gracefully', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Create array of 1001 files (over limit)
    const files = Array.from({ length: 1001 }, (_, i) => `test-data/label${i}.jpg`);

    await fileInput.setInputFiles(files.slice(0, 10)); // Mock with 10

    await page.click('button:has-text("Validate Batch")');

    // Should show error
    await expect(page.locator('text=Maximum 1000 files per batch')).toBeVisible();
  });
});
```

### Validation Results E2E Test

**File**: `apps/web/e2e/validation-results.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Validation Results Page', () => {
  test.beforeEach(async ({ page }) => {
    // Upload a label first
    await page.goto('http://localhost:3000/upload-label');
    await page.fill('input[name="brandName"]', 'Results Test Beer');
    await page.fill('input[name="alcoholByVolume"]', '5.5');
    await page.fill('input[name="netContents"]', '12 fl oz');
    await page.selectOption('select[name="classType"]', 'beer');
    await page.fill('textarea[name="governmentWarning"]', 'WARNING: Government warning');
    await page.fill('input[name="producerName"]', 'Test Brewery');
    await page.click('button[type="submit"]');

    // Should redirect to results
    await page.waitForURL('**/validation-results');
  });

  // Test 1: Display validation results
  test('should display compliant label result', async ({ page }) => {
    // Result should show as compliant
    await expect(
      page.locator('[data-testid="compliance-badge"]:has-text("COMPLIANT")')
    ).toBeVisible();

    // All rules should pass
    const passedRules = page.locator('[data-testid="rule"]:has-text("✓")');
    const failedRules = page.locator('[data-testid="rule"]:has-text("✗")');

    await expect(passedRules.first()).toBeVisible();
    await expect(failedRules).not.toBeVisible();
  });

  // Test 2: Cross-check with application
  test('should allow cross-check with application', async ({ page }) => {
    // Click cross-check button
    await page.click('button:has-text("Cross-Check")');

    // Modal should open
    await expect(page.locator('text=Cross-Check with Application')).toBeVisible();

    // Select application from dropdown
    await page.selectOption('select[name="applicationId"]', '1');

    // Submit
    await page.click('button[type="submit"]:has-text("Check")');

    // Results should show
    await expect(page.locator('[data-testid="match-percentage"]')).toBeVisible();
  });

  // Test 3: Export results
  test('should export results as JSON', async ({ page }) => {
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export JSON")');
    const download = await downloadPromise;

    // Verify file
    expect(download.suggestedFilename()).toMatch(/validation-result-\d+.json/);
  });

  // Test 4: Navigate back to upload
  test('should navigate back to upload form', async ({ page }) => {
    // Click "Upload Another" button
    await page.click('button:has-text("Upload Another Label")');

    // Should go back to upload page
    await page.waitForURL('**/upload-label');
    await expect(page.locator('input[name="brandName"]')).toBeVisible();
  });
});
```

---

## Coverage Expectations

### Coverage Goals

We target **70%+ coverage** across four metrics:

| Metric         | Target | Purpose                           |
| -------------- | ------ | --------------------------------- |
| **Statements** | 70%+   | How many lines of code executed   |
| **Branches**   | 70%+   | How many if/else paths tested     |
| **Functions**  | 70%+   | How many functions/methods tested |
| **Lines**      | 70%+   | How many actual lines tested      |

### Coverage by Module

```
apps/api/
├── modules/label/        → 85% (critical business logic)
├── modules/application/  → 80% (critical business logic)
├── modules/validation/   → 90% (TTB compliance critical)
├── modules/batch/        → 75% (user-facing feature)
└── modules/health/       → 60% (simple health checks)

libs/
├── validation-engine/    → 95% (core library)
├── label-parser/         → 70% (OCR placeholder)
├── ttb-rules/           → 95% (compliance rules)
├── logger/              → 80% (utility)
├── config/              → 75% (utility)
├── shared-types/        → N/A (types only)
└── test-data-generator/ → 85% (utility)

apps/web/
├── pages/               → 75% (UI)
├── components/          → 80% (UI)
└── hooks/               → 70% (utilities)
```

### Viewing Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html

# View in terminal
npm run test:coverage -- --coverage

# Check specific file
npm run test:coverage -- --collectCoverageFrom="apps/api/src/**/*.ts"
```

### Sample Coverage Output

```
File                      | % Stmts | % Branches | % Funcs | % Lines |
--------------------------|---------|-----------|---------|---------|
All files                 |   74.2  |    71.3    |   75.1  |   74.0  |
 apps/api/src             |   82.3  |    79.5    |   83.2  |   82.1  |
  modules/label           |   85.1  |    82.3    |   86.4  |   85.0  |
  modules/validation      |   90.2  |    88.5    |   91.1  |   90.1  |
 libs/validation-engine   |   95.0  |    94.2    |   95.5  |   94.9  |
 libs/ttb-rules          |   94.8  |    93.1    |   95.2  |   94.7  |
```

---

## Running Tests

### Quick Reference

```bash
# Run all tests once
npm run test

# Watch mode (rerun on file change)
npm run test:watch

# Generate coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E with browser visible
npm run test:e2e -- --headed

# E2E debug mode
npm run test:e2e -- --debug
```

### Unit Tests

```bash
# All unit tests
npm run test

# API unit tests only
pnpm --filter api test

# Specific library
pnpm --filter @ttb/validation-engine test

# Watch mode
npm run test:watch

# Specific test file
npm run test -- label.service.spec.ts

# Specific test suite
npm run test -- --testNamePattern="LabelService"

# With coverage
npm run test:coverage

# Update snapshots
npm run test -- -u
```

### Integration Tests

```bash
# All integration tests
npm run test -- --testPathPattern=integration

# Specific integration test
npm run test -- apps/api/test/label.integration.spec.ts

# With coverage
npm run test:coverage -- --testPathPattern=integration
```

### E2E Tests

```bash
# All E2E tests
npm run test:e2e

# Headed mode (can see browser)
npm run test:e2e -- --headed

# Debug mode (with inspector)
npm run test:e2e -- --debug

# Specific E2E test file
npm run test:e2e -- upload-label.spec.ts

# Specific test case
npm run test:e2e -- -g "should upload label"

# Update snapshots
npm run test:e2e -- --update-snapshots

# Run in CI mode (headless)
npm run test:e2e -- --ci
```

### Coverage Reports

```bash
# Generate coverage
npm run test:coverage

# View in browser
open coverage/index.html

# JSON format for CI
npm run test:coverage -- --json

# LCOV format for integrations
npm run test:coverage -- --lcov

# Check coverage thresholds
npm run test:coverage -- --checkCoverageThresholds
```

---

## Test Data

💡 **See [TEST_DATA.md](./TEST_DATA.md) for comprehensive test data documentation, pre-seeded fixtures, and manual testing workflows.**

The application includes automatically seeded test data for development and testing:

- **9 pre-configured applications** (5 valid, 4 edge cases, negative scenarios)
- **10 label validation scenarios** (matching, mismatching, partial match)
- **Quick reference test values** for manual testing
- **API test endpoints** for automated testing

### Pre-Seeded Test Applications

Test applications are automatically loaded on API startup:

```bash
# List all test applications (by COLA number)
curl http://localhost:3001/applications | jq '.[] | "\(.colaNumber || "No COLA") - \(.brandName)"'

# List just COLA numbers
curl http://localhost:3001/applications | jq '.[].colaNumber'

# Get specific application by COLA number
curl http://localhost:3001/applications/cola/COLA-2024-001
```

Available test COLA numbers:

- `COLA-2024-001` - Hoppy Trails IPA (6.5% ABV)
- `COLA-2024-002` - Reserve Cabernet Sauvignon (13.5% ABV)
- `COLA-2024-003` - Kentucky Oak Bourbon (42% ABV)
- Plus 6 additional test applications

### Using Test Fixtures in Code

```typescript
// Import test fixtures
import { getValidTestApplications } from '@ttb/api/fixtures/test-applications.fixture';
import { getLabelScenariosByValidation } from '@ttb/api/fixtures/test-labels.fixture';

// Get valid test applications
const validApps = getValidTestApplications();

// Get label scenarios by validation type
const matchingLabels = getLabelScenariosByValidation('match');
const mismatchingLabels = getLabelScenariosByValidation('mismatch');
```

### Synthetic Data Generation

For generating additional test data:

```bash
# Generate all test data
npm run generate:test-data

# Creates test-data/ with:
# ├── labels.json (100 synthetic labels)
# ├── applications.json (100 COLA apps)
# ├── matching-pairs.json (50 matching pairs)
# └── mismatched-pairs.json (50 mismatched pairs)
```

### Using In Tests

```typescript
// Import test data generator
import { TestDataGenerator } from '@ttb/test-data-generator';

// Single label
const label = TestDataGenerator.generateTestLabel();

// Matching pair for cross-check testing
const { label, application } = TestDataGenerator.generateMatchingPair();

// Batch of labels
const batch = TestDataGenerator.generateBatch(50);

// With custom properties
const custom = TestDataGenerator.generateTestLabel({
  brandName: 'Custom Brand',
  alcoholByVolume: 7.5,
});
```

---

## Best Practices

### 1. Naming Conventions

```typescript
// ✅ Good - Describes behavior
describe('LabelService', () => {
  describe('create', () => {
    it('should create and return label with valid data');
    it('should throw error for empty brand name');
    it('should accept ABV between 0 and 100');
  });
});

// ❌ Bad - Too vague
describe('Tests', () => {
  it('test 1');
  it('test 2');
  it('works');
});
```

### 2. AAA (Arrange-Act-Assert) Pattern

```typescript
// ✅ Good - Clear structure
it('should validate compliant label', () => {
  // Arrange: Setup test data
  const label: LabelData = {
    brandName: 'Test',
    alcoholByVolume: 5.5,
    // ...
  };

  // Act: Execute logic
  const result = engine.validateLabel(label);

  // Assert: Verify result
  expect(result.isCompliant).toBe(true);
  expect(result.errors).toHaveLength(0);
});

// ❌ Bad - Unclear structure
it('should work', () => {
  const label = { brandName: 'Test', alcoholByVolume: 5.5 };
  const result = engine.validateLabel(label);
  expect(result.isCompliant).toBe(true);
});
```

### 3. DRY (Don't Repeat Yourself)

```typescript
// ✅ Good - Reusable fixtures
const validLabel: LabelData = {
  brandName: 'Test Brand',
  alcoholByVolume: 5.5,
  netContents: '12 fl oz',
  governmentWarning: 'WARNING: ...',
  classType: 'beer',
  producerName: 'Brewery',
};

beforeEach(() => {
  // Reset before each test
  jest.clearAllMocks();
});

// ❌ Bad - Repeated test data
it('test 1', () => {
  const label = {
    brandName: 'Test Brand',
    alcoholByVolume: 5.5,
    netContents: '12 fl oz',
    governmentWarning: 'WARNING: ...',
    classType: 'beer',
    producerName: 'Brewery',
  };
  // ...
});

it('test 2', () => {
  const label = {
    brandName: 'Test Brand',
    alcoholByVolume: 5.5,
    netContents: '12 fl oz',
    governmentWarning: 'WARNING: ...',
    classType: 'beer',
    producerName: 'Brewery',
  };
  // ...
});
```

### 4. Test Independence

```typescript
// ✅ Good - Tests don't depend on each other
it('test A', () => {
  const result = service.create(data);
  expect(result).toBeDefined();
});

it('test B', () => {
  const result = service.findAll();
  expect(result).toBeDefined();
});

// ❌ Bad - Test depends on previous test
let sharedState = null;

it('test A', () => {
  sharedState = service.create(data);
});

it('test B', () => {
  // Depends on sharedState from test A!
  expect(sharedState).toBeDefined();
});
```

### 5. Comprehensive Coverage

```typescript
// ✅ Good - Tests multiple scenarios
describe('validateLabel', () => {
  // Happy path
  it('should return COMPLIANT for valid label');

  // Error paths
  it('should return error for missing brand name');
  it('should return error for invalid ABV');
  it('should return error for missing warning');

  // Edge cases
  it('should accept ABV of 0%');
  it('should accept ABV of 100%');
  it('should handle very long strings');
  it('should handle special characters');
});
```

### 6. Mocking Best Practices

```typescript
// ✅ Good - Mock only what needed
beforeEach(() => {
  service = new LabelService(
    mockLogger,
    realValidationEngine // Don't mock if not needed
  );
});

// ❌ Bad - Over-mocking
beforeEach(() => {
  service = new LabelService(
    mockLogger,
    mockValidationEngine,
    mockPrisma,
    mockConfig,
    mockEverything // Defeats the purpose of testing
  );
});
```

---

## Debugging Tests

### Run Single Test

```bash
# Run one test file
npm run test -- label.service.spec.ts

# Run tests matching pattern
npm run test -- --testNamePattern="should create"

# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### VS Code Debugger

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/jest/bin/jest.js",
  "args": ["--runInBand", "${file}"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Playwright Debug Mode

```bash
# Run with Inspector UI
npm run test:e2e -- --debug

# Pause on first test
npm run test:e2e -- --headed --debug-on-failure
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: ttb_test
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install

      - run: npm run lint

      - run: npm run test:coverage

      - run: npm run test:e2e

      # Upload coverage to Codecov
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

---

**Last Updated**: March 2024  
**Coverage Target**: 70%+  
**Test Runners**: Jest, Vitest, Playwright

## Test Structure

```
apps/api/
├── src/
│   ├── modules/
│   │   └── label/
│   │       ├── label.service.ts
│   │       └── label.service.spec.ts  ← Test file
│   └── ...
└── test/
    ├── label.service.spec.ts
    ├── health.controller.spec.ts
    └── ...

apps/web/
├── src/
│   └── ...
└── __tests__/
    └── unit/
```

## Unit Tests

### Label Service Tests

```typescript
describe('LabelService', () => {
  let service: LabelService;
  let logger: LoggerService;

  beforeEach(() => {
    logger = new LoggerService({ level: 'info', format: 'json' });
    service = new LabelService(logger);
  });

  describe('create', () => {
    it('should create a label', () => {
      const dto = {
        brandName: 'Test Brand',
        alcoholByVolume: 5.5,
        netContents: '12 fl oz',
        governmentWarning: 'Warning',
        classType: 'beer',
        producerName: 'Brewery',
      };

      const result = service.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.brandName).toBe('Test Brand');
    });

    it('should throw for invalid data', () => {
      const invalidDto = {
        brandName: '', // Empty not allowed
        alcoholByVolume: 5.5,
        netContents: '12 fl oz',
        governmentWarning: 'Warning',
        classType: 'beer',
        producerName: 'Brewery',
      };

      expect(() => service.create(invalidDto)).toThrow();
    });
  });

  describe('findOne', () => {
    it('should find label by ID', () => {
      const created = service.create({ ...validDto });
      const found = service.findOne(created.id!);

      expect(found).toEqual(created);
    });

    it('should throw NotFoundException for missing label', () => {
      expect(() => service.findOne('invalid-id')).toThrow('not found');
    });
  });
});
```

### Validation Engine Tests

```typescript
describe('ValidationEngine', () => {
  let engine: ValidationEngine;

  beforeEach(() => {
    engine = new ValidationEngine();
  });

  describe('validateLabel', () => {
    it('should pass compliant label', () => {
      const label: LabelData = {
        brandName: 'Compliant Brand',
        alcoholByVolume: 5.5,
        netContents: '12 fl oz',
        governmentWarning: 'WARNING: ...',
        classType: 'beer',
        producerName: 'Brewery',
      };

      const result = engine.validateLabel(label);

      expect(result.isCompliant).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail label with missing brand name', () => {
      const label: LabelData = {
        brandName: '', // Missing
        alcoholByVolume: 5.5,
        netContents: '12 fl oz',
        governmentWarning: 'WARNING: ...',
        classType: 'beer',
        producerName: 'Brewery',
      };

      const result = engine.validateLabel(label);

      expect(result.isCompliant).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail label with invalid ABV', () => {
      const label: LabelData = {
        brandName: 'Test',
        alcoholByVolume: 150, // Invalid: > 100
        netContents: '12 fl oz',
        governmentWarning: 'WARNING: ...',
        classType: 'beer',
        producerName: 'Brewery',
      };

      const result = engine.validateLabel(label);

      expect(result.isCompliant).toBe(false);
      expect(result.ttbValidationResult?.abvValid).toBe(false);
    });
  });
});
```

### Cross-Check Validator Tests

```typescript
describe('CrossCheckValidator', () => {
  let validator: CrossCheckValidator;

  beforeEach(() => {
    validator = new CrossCheckValidator();
  });

  describe('validateLabelAgainstApplication', () => {
    it('should match identical label and application', () => {
      const label: LabelData = {
        brandName: 'Premium Ale',
        alcoholByVolume: 6.2,
        netContents: '12 fl oz (355 mL)',
        governmentWarning: 'WARNING: ...',
        classType: 'beer',
        producerName: 'BrewCo',
      };

      const app: ApplicationData = {
        brandName: 'Premium Ale',
        alcoholByVolume: 6.2,
        netContents: '12 fl oz (355 mL)',
        producerName: 'BrewCo',
      };

      const result = validator.validateLabelAgainstApplication(label, app);

      expect(result.match).toBe(true);
      expect(result.discrepancies).toHaveLength(0);
      expect(result.matchPercentage).toBe(100);
    });

    it('should detect brand name mismatch', () => {
      const label: LabelData = {
        ...validLabel,
        brandName: 'Premium Ale',
      };

      const app: ApplicationData = {
        ...validApp,
        brandName: 'Premium Ale - Different',
      };

      const result = validator.validateLabelAgainstApplication(label, app);

      expect(result.match).toBe(false);
      expect(result.discrepancies.length).toBeGreaterThan(0);
    });

    it('should allow small ABV tolerance', () => {
      const label: LabelData = {
        ...validLabel,
        alcoholByVolume: 6.0,
      };

      const app: ApplicationData = {
        ...validApp,
        alcoholByVolume: 6.05, // 0.05% difference within tolerance
      };

      const result = validator.validateLabelAgainstApplication(label, app);

      expect(result.match).toBe(true);
    });
  });
});
```

## Integration Tests

### Label Workflow Integration Test

```typescript
describe('Label Workflow', () => {
  let labelService: LabelService;
  let validationService: ValidationService;
  let logger: LoggerService;

  beforeEach(() => {
    logger = new LoggerService({ level: 'info', format: 'json' });
    labelService = new LabelService(logger);
    validationService = new ValidationService();
  });

  it('should complete full label validation workflow', () => {
    // 1. Create label
    const labelDto = { ...validLabelDto };
    const label = labelService.create(labelDto);

    // 2. Retrieve label
    const retrieved = labelService.findOne(label.id!);
    expect(retrieved).toEqual(label);

    // 3. Validate label
    const validation = validationService.validateLabel(retrieved);
    expect(validation.isCompliant).toBe(true);

    // 4. Verify results stored
    expect(validation.status).toBe(ValidationStatus.COMPLETED);
  });

  it('should handle validation with warnings', () => {
    const labelWithWarning = {
      ...validLabelDto,
      // Add data that triggers warnings
    };

    const label = labelService.create(labelWithWarning);
    const validation = validationService.validateLabel(label);

    expect(validation.isCompliant).toBe(true);
    expect(validation.warnings.length).toBeGreaterThan(0);
  });
});
```

## E2E Tests (Playwright)

### Label Upload Flow

```typescript
import { test, expect } from '@playwright/test';

test.describe('Label Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should upload label successfully', async ({ page }) => {
    // Navigate to upload page
    await page.click('text=Upload Label');
    await page.waitForURL('**/upload-label');

    // Fill form
    await page.fill('input[placeholder="Premium Craft Beer"]', 'Test Brewery IPA');
    await page.fill('input[placeholder="5.5"]', '6.5');
    await page.fill('input[placeholder="12 fl oz"]', '12 fl oz (355 mL)');

    // Select class type
    await page.selectOption('select', 'beer');

    // Submit
    await page.click('button:has-text("Upload Label")');

    // Verify success message
    await expect(page.locator('text=Label uploaded successfully')).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    // Navigate and leave required field empty
    await page.click('text=Upload Label');
    await page.click('button:has-text("Upload Label")');

    // Verify error messages
    await expect(page.locator('text=Brand name is required')).toBeVisible();
  });
});
```

### Batch Validation Flow

```typescript
test('should batch validate multiple labels', async ({ page }) => {
  await page.goto('http://localhost:3000/batch-validation');

  // Mock file uploads
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles([
    'test-data/label1.jpg',
    'test-data/label2.jpg',
    'test-data/label3.jpg',
  ]);

  // Verify file count display
  await expect(page.locator('text=3 file(s) selected')).toBeVisible();

  // Submit batch
  await page.click('button:has-text("Validate")');

  // Wait for results
  await page.waitForURL('**/validation-results');

  // Verify results displayed
  await expect(page.locator('[data-testid="batch-results"]')).toBeVisible();
});
```

## Running Tests

### Unit Tests

```bash
npm run test                       # Run all unit tests
npm run test:watch               # Watch mode
npm run test:coverage            # Coverage report

pnpm --filter api test           # API tests only
pnpm --filter @ttb/validation-engine test
```

### Integration Tests

```bash
npm run test -- --testPathPattern=integration
```

### E2E Tests

```bash
npm run test:e2e                 # Run Playwright tests
npm run test:e2e -- --headed    # Headed mode (see browser)
npm run test:e2e -- --debug     # Debug mode
```

### Generate Coverage

```bash
npm run test:coverage

# View coverage report
open coverage/index.html
```

## Test Data Generation

### Using TestDataGenerator

```typescript
import { TestDataGenerator } from '@ttb/test-data-generator';

// Single label
const label = TestDataGenerator.generateTestLabel();

// Matching pair
const { label, application } = TestDataGenerator.generateMatchingPair();

// Mismatched pair
const { label, application } = TestDataGenerator.generateMismatchedPair();

// Batch
const labels = TestDataGenerator.generateBatch(10);
const apps = TestDataGenerator.generateApplicationBatch(10);
```

### CLI Generation

```bash
npm run generate:test-data

# Creates test-data/
#   ├── labels.json
#   ├── applications.json
#   ├── matching-pairs.json
#   └── mismatched-pairs.json
```

## Testing Best Practices

### 1. Test Naming

```typescript
// ✅ Good - Describes behavior
it('should return compliant status for valid label');

// ❌ Bad - Unclear
it('test validation');
```

### 2. AAA Pattern

```typescript
// Arrange - Setup
const label = createTestLabel();

// Act - Execute
const result = service.validate(label);

// Assert - Verify
expect(result.isCompliant).toBe(true);
```

### 3. DRY Tests

```typescript
// ✅ Use beforeEach for common setup
beforeEach(() => {
  service = new ValidationService();
});

// ❌ Avoid repeating setup
it('test 1', () => {
  const service = new ValidationService();
});
it('test 2', () => {
  const service = new ValidationService();
});
```

### 4. Isolation

```typescript
// ✅ Each test is independent
it('test A', () => { ... });
it('test B', () => { ... });  // Not dependent on A

// ❌ Avoid test interdependencies
let shared = {};
it('test A', () => { shared.value = 1; });
it('test B', () => { expect(shared.value).toBe(1); }); // Brittle
```

### 5. Comprehensive Coverage

```typescript
// Test success path
it('should validate compliant label', () => { ... });

// Test error paths
it('should reject invalid ABV', () => { ... });
it('should require brand name', () => { ... });

// Test edge cases
it('should handle empty strings', () => { ... });
it('should handle null values', () => { ... });
it('should handle very long strings', () => { ... });
```

## Continuous Integration

### GitHub Actions (Future)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: npm run lint
      - run: npm run test:coverage
      - run: npm run test:e2e
```

## Coverage Goals

| Category   | Target | Current |
| ---------- | ------ | ------- |
| Statements | 70%+   | -       |
| Branches   | 70%+   | -       |
| Functions  | 70%+   | -       |
| Lines      | 70%+   | -       |

## Debugging Tests

### Debug Single Test

```bash
node --inspect-brk node_modules/.bin/jest --runInBand test-file.spec.ts
```

### Chrome DevTools

- Open `chrome://inspect`
- Connect to Node process
- Set breakpoints and debug

### VS Code Debugger

```json
{
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/node_modules/jest/bin/jest.js",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
