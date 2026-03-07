# Test Data & Fixtures Guide

Comprehensive guide to test data, fixtures, and manual testing for the TTB Label Compliance Validation Platform.

## Overview

The application includes automatically seeded test data for development and testing. Test fixtures are organized into categories for positive validation, negative validation, and edge cases.

**Status**: ✅ Test data automatically seeded on API startup  
**Location**: In-memory database (resets on restart)  
**Count**: 9 pre-configured applications + label scenarios

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Applications](#test-applications)
3. [Label Test Scenarios](#label-test-scenarios)
4. [Manual Testing Guide](#manual-testing-guide)
5. [API Endpoints](#api-endpoints)
6. [Validation Rules](#validation-rules)
7. [Test Images](#test-images)
8. [Development Notes](#development-notes)

---

## Quick Start

### Verify Test Data Loaded

```bash
# Check API health
curl http://localhost:3001/health

# List all test applications (by COLA number)
curl http://localhost:3001/applications | jq '.[] | "\(.colaNumber || "No COLA") - \(.brandName)"'

# List just COLA numbers
curl http://localhost:3001/applications | jq '.[].colaNumber'

# Get specific application by COLA number
curl http://localhost:3001/applications/cola/COLA-2024-001 | jq '.'
```

### Quick Test Scenarios

Copy-paste ready test values for immediate validation testing:

#### ✅ Test 1: Perfect Match (Should Pass)

- **COLA Number**: `COLA-2024-001`
- **Brand Name**: `Hoppy Trails IPA`
- **ABV**: `6.5`
- **Net Contents**: `12 fl oz (355 mL)`
- **Producer**: `Mountain View Brewery`
- **Expected**: All validations pass ✅

#### ❌ Test 2: Brand Mismatch (Should Fail)

- **COLA Number**: `COLA-2024-001`
- **Brand Name**: `Different IPA Name` ← intentional error
- **ABV**: `6.5`
- **Net Contents**: `12 fl oz (355 mL)`
- **Producer**: `Mountain View Brewery`
- **Expected**: Brand name mismatch error ❌

#### ⚠️ Test 3: ABV Within Tolerance (Should Warn)

- **COLA Number**: `COLA-2024-001`
- **Brand Name**: `Hoppy Trails IPA`
- **ABV**: `6.3` ← 0.2% difference (acceptable)
- **Net Contents**: `12 fl oz (355 mL)`
- **Producer**: `Mountain View Brewery`
- **Expected**: Warning but passes ⚠️

---

## Test Applications

### Implementation

**File**: `apps/api/src/app/fixtures/test-applications.fixture.ts`  
**Seeding**: `apps/api/src/app/modules/application/application.service.ts` → `seedTestData()`  
**Trigger**: Automatic on API startup via `apps/api/src/main.ts`

### Positive Test Applications (Valid)

Perfect applications that should pass all validation checks:

| COLA Number   | Brand Name                 | Type   | ABV   | Size     | Producer                |
| ------------- | -------------------------- | ------ | ----- | -------- | ----------------------- |
| COLA-2024-001 | Hoppy Trails IPA           | Beer   | 6.5%  | 12 fl oz | Mountain View Brewery   |
| COLA-2024-002 | Reserve Cabernet Sauvignon | Wine   | 13.5% | 750 mL   | Valley Vineyards        |
| COLA-2024-003 | Kentucky Oak Bourbon       | Spirit | 42%   | 750 mL   | Heritage Distillery Co. |
| COLA-2024-004 | Lite Golden Lager          | Beer   | 4.2%  | 12 fl oz | Sunrise Brewing Company |
| COLA-2024-005 | Orchard Select Hard Cider  | Cider  | 5.8%  | 12 fl oz | Apple Valley Cidery     |

**Use Cases**:

- Positive validation testing
- Reference data for matching label scenarios
- API integration testing
- COLA number lookup verification

### Negative Test Applications (Warnings/Errors)

Applications with intentional issues for error handling tests:

| COLA Number      | Issue                | ABV  | Expected Result              |
| ---------------- | -------------------- | ---- | ---------------------------- |
| COLA-INVALID-001 | Too low ABV          | 0.5% | ⚠️ Below minimum threshold   |
| COLA-INVALID-002 | Unrealistic high ABV | 95%  | ⚠️ Exceeds reasonable limits |
| COLA-INVALID-003 | Mismatched naming    | 5.5% | ⚠️ Product type confusion    |
| (none)           | Missing COLA number  | 6.0% | ⚠️ Missing identifier        |
| COLA-2010-999    | Expired approval     | 5.5% | ⚠️ Old approval date         |

**Use Cases**:

- Error handling validation
- Warning message testing
- Edge case detection
- Input validation testing

### Edge Case Applications

Boundary condition testing:

| Name            | Purpose         | ABV   | Notes                  |
| --------------- | --------------- | ----- | ---------------------- |
| Session IPA     | Minimum ABV     | 3.0%  | Lowest acceptable beer |
| Imperial Stout  | Maximum ABV     | 12.0% | High but valid beer    |
| Special Release | Unusual size    | 7.5%  | 500 mL container       |
| New Release Ale | Recent approval | 6.8%  | Current date approval  |

**Use Cases**:

- Boundary value testing
- Tolerance validation
- Format variation testing

---

## Label Test Scenarios

### Implementation

**File**: `apps/api/src/app/fixtures/test-labels.fixture.ts`  
**Structure**: Organized by expected validation outcome  
**Count**: 10 scenarios (3 match, 5 mismatch, 2 partial)

### Matching Label Scenarios (Perfect Match)

Labels that exactly match their corresponding applications:

#### Scenario 1: Hoppy Trails IPA

- **Matches**: COLA-2024-001
- **Brand**: Hoppy Trails IPA
- **ABV**: 6.5%
- **Contents**: 12 fl oz (355 mL)
- **Producer**: Mountain View Brewery
- **Warnings**: None
- **Expected**: ✅ VALID

#### Scenario 2: Reserve Cabernet Sauvignon

- **Matches**: COLA-2024-002
- **Brand**: Reserve Cabernet Sauvignon
- **ABV**: 13.5%
- **Contents**: 750 mL
- **Producer**: Valley Vineyards
- **Warnings**: None
- **Expected**: ✅ VALID

#### Scenario 3: Kentucky Oak Bourbon

- **Matches**: COLA-2024-003
- **Brand**: Kentucky Oak Bourbon
- **ABV**: 42%
- **Contents**: 750 mL
- **Producer**: Heritage Distillery Co.
- **Warnings**: None
- **Expected**: ✅ VALID

### Mismatching Label Scenarios (Compliance Issues)

Labels with intentional discrepancies for validation testing:

#### Scenario 4: Brand Name Mismatch

- **Compared to**: COLA-2024-001
- **Issue**: Brand = "Different IPA Name"
- **Expected**: ❌ Brand name does not match

#### Scenario 5: ABV Outside Tolerance

- **Compared to**: COLA-2024-001
- **Issue**: ABV = 7.2% (0.7% difference)
- **Expected**: ❌ ABV exceeds tolerance (>0.3%)

#### Scenario 6: Container Size Mismatch

- **Compared to**: COLA-2024-002
- **Issue**: Contents = 375 mL (should be 750 mL)
- **Expected**: ❌ Container size does not match

#### Scenario 7: Producer Name Mismatch

- **Compared to**: COLA-2024-003
- **Issue**: Producer = "Different Distillery Inc."
- **Expected**: ❌ Unauthorized producer

#### Scenario 8: Missing Warning Statement

- **Compared to**: COLA-2024-001
- **Issue**: governmentWarning = false
- **Expected**: ❌ Required warning missing

### Partial Match Scenarios (Warnings)

Minor discrepancies that may be acceptable:

#### Scenario 9: Minor ABV Variation

- **Compared to**: COLA-2024-001
- **Issue**: ABV = 6.3% (0.2% difference)
- **Expected**: ⚠️ Within tolerance

#### Scenario 10: Alternative Brand Format

- **Compared to**: COLA-2024-002
- **Issue**: Brand = "Reserve Cabernet" (shortened)
- **Expected**: ⚠️ Needs review

### Quick Reference Code

**File**: `apps/api/src/app/fixtures/quick-test-reference.ts`

Import for copy-paste test values:

```typescript
import { QUICK_TEST_DATA, TEST_SCENARIOS } from './fixtures/quick-test-reference';

// Use in test setup
const testData = QUICK_TEST_DATA.positiveMatch;
// { colaNumber: 'COLA-2024-001', brandName: 'Hoppy Trails IPA', ... }
```

---

## Manual Testing Guide

Step-by-step instructions for testing validation workflows.

### Setup

1. **Start Servers**:

   ```bash
   npm run dev
   ```

   - API: http://localhost:3001
   - Web: http://localhost:3000

2. **Verify Test Data**:
   ```bash
   curl http://localhost:3001/applications | jq 'length'
   # Expected: 9
   ```

### Test Workflow 1: Perfect Match Validation

**Objective**: Verify that matching label data passes all validations

1. Navigate to http://localhost:3000/upload-label
2. Upload any test image (content doesn't matter for manual entry)
3. Select application: **COLA-2024-001**
4. Enter label data:
   - Brand Name: `Hoppy Trails IPA`
   - ABV: `6.5`
   - Net Contents: `12 fl oz (355 mL)`
   - Producer Name: `Mountain View Brewery`
5. Click **Run Validation**

**Expected Result**: ✅ All validation checks pass

### Test Workflow 2: Brand Name Error Detection

**Objective**: Verify that brand name mismatches are detected

1. Navigate to Validate Label page
2. Upload test image
3. Select application: **COLA-2024-001**
4. Enter label data with **intentional mismatch**:
   - Brand Name: `Different IPA Name` ← wrong
   - ABV: `6.5`
   - Net Contents: `12 fl oz (355 mL)`
   - Producer Name: `Mountain View Brewery`
5. Click **Run Validation**

**Expected Result**: ❌ Brand name mismatch error displayed

### Test Workflow 3: ABV Tolerance Check

**Objective**: Verify ABV tolerance thresholds

1. Navigate to Validate Label page
2. Select application: **COLA-2024-001**
3. Enter label data with **minor ABV difference**:
   - Brand Name: `Hoppy Trails IPA`
   - ABV: `6.3` ← 0.2% under (within 0.3% tolerance)
   - Net Contents: `12 fl oz (355 mL)`
   - Producer Name: `Mountain View Brewery`
4. Click **Run Validation**

**Expected Result**: ⚠️ Warning shown but validation passes

### Test Workflow 4: Multiple Validation Errors

**Objective**: Verify multiple errors are detected simultaneously

1. Navigate to Validate Label page
2. Select application: **COLA-2024-001**
3. Enter label data with **multiple errors**:
   - Brand Name: `Wrong Brand`
   - ABV: `7.5` ← out of tolerance
   - Net Contents: `16 fl oz` ← wrong size
   - Producer Name: `Different Brewery`
4. Click **Run Validation**

**Expected Result**: ❌ Multiple errors displayed (brand, ABV, contents, producer)

### Test Workflow 5: Wine Validation

**Objective**: Verify wine-specific validation rules

1. Navigate to Validate Label page
2. Select application: **COLA-2024-002**
3. Enter wine label data:
   - Brand Name: `Reserve Cabernet Sauvignon`
   - ABV: `13.5`
   - Net Contents: `750 mL`
   - Producer Name: `Valley Vineyards`
4. Click **Run Validation**

**Expected Result**: ✅ Wine validation passes (includes sulfite check)

### Test Workflow 6: High-ABV Spirit Validation

**Objective**: Verify spirit validation with high ABV

1. Navigate to Validate Label page
2. Select application: **COLA-2024-003**
3. Enter spirit label data:
   - Brand Name: `Kentucky Oak Bourbon`
   - ABV: `42`
   - Net Contents: `750 mL`
   - Producer Name: `Heritage Distillery Co.`
4. Click **Run Validation**

**Expected Result**: ✅ Spirit validation passes

---

## API Endpoints

### Get All Applications

```bash
GET http://localhost:3001/applications
```

**Response**:

```json
[
  {
    "id": "uuid-here",
    "brandName": "Hoppy Trails IPA",
    "alcoholByVolume": 6.5,
    "netContents": "12 fl oz (355 mL)",
    "producerName": "Mountain View Brewery",
    "colaNumber": "COLA-2024-001",
    "approvalDate": "2024-01-15T00:00:00.000Z",
    "createdAt": "2026-03-07T15:27:59.627Z",
    "updatedAt": "2026-03-07T15:27:59.627Z"
  }
  // ... more applications
]
```

### Get Application by COLA Number

```bash
GET http://localhost:3001/applications/cola/:colaNumber
```

**Example**:

```bash
curl http://localhost:3001/applications/cola/COLA-2024-001
```

**Response**:

```json
{
  "id": "1d74bc09-c076-45d3-add8-18941ce79b2f",
  "brandName": "Hoppy Trails IPA",
  "alcoholByVolume": 6.5,
  "netContents": "12 fl oz (355 mL)",
  "producerName": "Mountain View Brewery",
  "colaNumber": "COLA-2024-001",
  "approvalDate": "2024-01-15T00:00:00.000Z"
}
```

### Create New Application

```bash
POST http://localhost:3001/applications
Content-Type: application/json

{
  "brandName": "My New Beer",
  "alcoholByVolume": 5.0,
  "netContents": "12 fl oz",
  "producerName": "My Brewery",
  "colaNumber": "COLA-2024-NEW",
  "approvalDate": "2024-03-01"
}
```

---

## Validation Rules

### ABV Tolerance

- **Pass**: ≤ 0.3% difference
- **Warning**: 0.3% to 0.5% difference
- **Fail**: > 0.5% difference

**Examples**:

- Application: 6.5% ABV
  - 6.2% to 6.8% → ✅ Pass
  - 6.1% or 6.9% → ⚠️ Warning
  - < 6.0% or > 7.0% → ❌ Fail

### Required Fields

All applications and labels must include:

- ✅ Brand Name (exact match required)
- ✅ Alcohol by Volume (within tolerance)
- ✅ Net Contents (format and amount must match)
- ✅ Producer Name (exact match required)

### Required Warning Statements

Labels must display:

- ✅ Government Warning Statement
- ✅ Surgeon General Warning
- ✅ Sulfite Statement (for wine)
- ✅ Allergen Statements (when applicable)

### COLA Number Format

- Normalized to uppercase
- Whitespace trimmed
- Format: `COLA-YYYY-NNN`
- Example: `COLA-2024-001`

---

## Test Images

### Directory Structure

```
apps/web/public/test-images/
├── README.md
└── (placeholder references)
```

### Image Placeholders

The application references these test images:

**Matching Scenarios**:

- `hoppy-trails-ipa.jpg` → COLA-2024-001
- `reserve-cabernet.jpg` → COLA-2024-002
- `kentucky-oak-bourbon.jpg` → COLA-2024-003

**Mismatch Scenarios**:

- `different-brand.jpg`
- `wrong-abv.jpg`
- `wrong-size.jpg`
- `wrong-producer.jpg`
- `missing-warning.jpg`

**Partial Match Scenarios**:

- `minor-abv-diff.jpg`
- `alt-brand-format.jpg`

### Using Test Images

**Option 1**: Add actual label images with matching filenames  
**Option 2**: Upload any image for testing (data entry is manual until OCR implemented)

**Recommended Specifications**:

- Format: JPG or PNG
- Size: 800x600 to 1200x900 pixels
- Resolution: 72-150 DPI
- Clear, legible text

---

## Development Notes

### Data Persistence

- **Storage**: In-memory Map (no database required)
- **Lifetime**: Data persists until server restart
- **Seeding**: Automatic on every API startup
- **IDs**: UUID v4 via `crypto.randomUUID()`

### COLA Number Normalization

```typescript
// Automatic normalization
normalizeColaNumber(cola: string): string {
  return cola?.trim().toUpperCase() || '';
}

// Input: "cola-2024-001"
// Stored: "COLA-2024-001"
```

### Date Handling

- All dates stored as JavaScript `Date` objects
- API accepts ISO 8601 date strings
- Default to current date if not provided
- `approvalDate` field is optional

### Validation Service Integration

Test applications are automatically available to the validation service:

```typescript
// Validation service can lookup by COLA number
const application = await applicationService.findByColaNumberOrThrow('COLA-2024-001');
```

### Environment Configuration

Required variables (already configured in `.env`):

```bash
API_PORT=3001
WEB_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=postgresql://user:password@localhost:5432/ttb_label_analyzer
```

---

## Automated Testing

### Unit Tests

Test fixtures are available for automated testing:

```typescript
import {
  getValidTestApplications,
  getWarningTestApplications,
} from './fixtures/test-applications.fixture';
import { getLabelScenariosByValidation } from './fixtures/test-labels.fixture';

describe('Validation Service', () => {
  it('should validate matching labels', () => {
    const validApps = getValidTestApplications();
    const matchingLabels = getLabelScenariosByValidation('match');
    // ... test logic
  });
});
```

### Integration Tests

Test data is automatically seeded for integration tests:

```typescript
describe('Application API', () => {
  beforeAll(async () => {
    // Test data automatically seeded on API startup
  });

  it('should retrieve application by COLA number', async () => {
    const response = await request(app).get('/applications/cola/COLA-2024-001');
    expect(response.status).toBe(200);
    expect(response.body.brandName).toBe('Hoppy Trails IPA');
  });
});
```

See [TESTING.md](./TESTING.md) for comprehensive testing documentation.

---

## Troubleshooting

### Test Data Not Loading

**Symptom**: API returns empty array for `/applications`

**Solution**:

```bash
# Restart API server
lsof -ti:3001 | xargs kill -9
npm run dev
```

### COLA Lookup Not Working

**Symptom**: 404 error when accessing `/applications/cola/:colaNumber`

**Check**:

- COLA number is uppercase: `COLA-2024-001` not `cola-2024-001`
- No extra whitespace
- Application was seeded (check server logs)

### Port Already in Use

**Symptom**: `EADDRINUSE` error on startup

**Solution**:

```bash
# Clear all ports
lsof -ti:3001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Missing Environment Variables

**Symptom**: `Missing required environment variables: DATABASE_URL`

**Solution**:

```bash
# Copy example env file
cp .env.example .env
# Restart servers
npm run dev
```

---

## Additional Resources

- [Main Testing Guide](./TESTING.md) - Automated testing strategies
- [API Documentation](http://localhost:3001/api/docs) - Swagger docs (when API running)
- [Getting Started Guide](./GETTING_STARTED.md) - Setup and installation
- [Architecture Documentation](./ARCHITECTURE.md) - System design

---

**Last Updated**: March 7, 2026  
**Status**: ✅ Test data system operational
