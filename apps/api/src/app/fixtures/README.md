# Test Fixtures

This directory contains test data fixtures for development and testing.

## Files

- **test-applications.fixture.ts** - Pre-configured application test data
- **test-labels.fixture.ts** - Label validation scenarios
- **quick-test-reference.ts** - Quick copy-paste test values

## Usage

Test applications are automatically seeded on API startup via the `seedTestData()` method in the ApplicationService.

## Documentation

📚 **For comprehensive documentation**, see **[docs/TEST_DATA.md](../../../../docs/TEST_DATA.md)**

The comprehensive guide includes:

- All test scenarios and fixtures
- Manual testing workflows
- API endpoints for testing
- Validation rules reference
- Quick start examples

## Quick Example

```typescript
import { getValidTestApplications } from './test-applications.fixture';
import { getLabelScenariosByValidation } from './test-labels.fixture';

// Get valid test applications
const validApps = getValidTestApplications();

// Get label scenarios by type
const matchingLabels = getLabelScenariosByValidation('match');
const mismatchingLabels = getLabelScenariosByValidation('mismatch');
```

## Test Data API

```bash
# List all seeded applications
curl http://localhost:3001/applications

# Get application by COLA number
curl http://localhost:3001/applications/cola/COLA-2024-001
```

---

**See [docs/TEST_DATA.md](../../../../docs/TEST_DATA.md) for complete documentation.**
