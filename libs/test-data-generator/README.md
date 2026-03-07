# Test Data Generator - Enhanced

Comprehensive test data generation for end-to-end testing of the TTB Label Analyzer application.

## Features

### Data Generation

- ✅ **Realistic Applications**: Type-specific brands, producers, ABV ranges, and container sizes
- ✅ **Test Labels**: Complete label data with government warnings
- ✅ **Matching Pairs**: Perfect matches for validation success testing
- ✅ **Mismatched Pairs**: Intentional mismatches for validation failure testing
- ✅ **Partial Match Pairs**: Minor ABV differences for tolerance testing
- ✅ **Label Images**: SVG-based visual representations of labels

### Alcohol Types Supported

- **Beer**: ABV 3.0-12.0%, containers 12-16 fl oz
- **Wine**: ABV 11.0-15.0%, containers 375 mL - 1.5 L
- **Distilled Spirits**: ABV 35.0-50.0%, containers 750 mL - 1.75 L
- **Cider**: ABV 4.0-8.0%, containers 12-16 fl oz

## Installation

```bash
cd libs/test-data-generator
nx build test-data-generator
```

## Command Line Usage

### Basic Generation

```bash
# Generate 10 applications, 10 labels, and test pairs
npx ttb-generate-test-data

# Generate 20 items
npx ttb-generate-test-data --count 20

# Generate with label images
npx ttb-generate-test-data --count 15 --with-images

# Custom output directory
npx ttb-generate-test-data --count 25 --output ./my-test-data

# Show help
npx ttb-generate-test-data --help
```

### CLI Options

```
-c, --count <number>      Number of items to generate (default: 10)
-i, --with-images         Generate label images (default: false)
-o, --output <dir>        Output directory (default: ./test-data)
-f, --format <format>     Image format: svg (default: svg)
-h, --help                Show help message
```

## Programmatic Usage

### Import the Library

```typescript
import { TestDataGenerator, TestImageGenerator } from '@ttb/test-data-generator';
```

### Generate Individual Items

```typescript
// Generate a single label with random realistic data
const label = TestDataGenerator.generateTestLabel();

// Generate a label with specific overrides
const customLabel = TestDataGenerator.generateTestLabel({
  brandName: 'My Custom Beer',
  alcoholByVolume: 5.5,
  netContents: '12 fl oz (355 mL)',
});

// Generate a single application
const application = TestDataGenerator.generateTestApplication();

// Generate with overrides
const customApp = TestDataGenerator.generateTestApplication({
  colaNumber: 'COLA-2024-999',
  brandName: 'Special Edition IPA',
});
```

### Generate Test Pairs

```typescript
// Matching pair (label matches application)
const { label, application } = TestDataGenerator.generateMatchingPair();

// Mismatched pair (intentionally different)
const { label, application } = TestDataGenerator.generateMismatchedPair();

// Partial match pair (minor ABV difference)
const { label, application } = TestDataGenerator.generatePartialMatchPair();
```

### Generate Batches

```typescript
// Generate 50 labels
const labels = TestDataGenerator.generateBatch(50);

// Generate 30 applications
const applications = TestDataGenerator.generateApplicationBatch(30);

// Generate realistic applications (uses type rotation for diversity)
const realisticApps = TestDataGenerator.generateRealisticApplications(20);
```

### Generate Images

```typescript
import path from 'path';

// Generate image for a single label
const label = TestDataGenerator.generateTestLabel();
const imagePath = await TestImageGenerator.generateLabelImage(
  label,
  path.join(__dirname, 'output', 'label.svg')
);

// Generate images for batch of labels
const labels = TestDataGenerator.generateBatch(10);
const imagePaths = await TestImageGenerator.generateBatch(
  labels,
  path.join(__dirname, 'output', 'images')
);
```

## Output Format

### Directory Structure (with --with-images)

```
test-data/
├── applications.json           # Generated applications
├── labels.json                 # Generated labels
├── matching-pairs.json         # Matching label-application pairs
├── mismatched-pairs.json       # Mismatched pairs
├── partial-match-pairs.json    # Partial match pairs
├── summary.json                # Generation summary
├── image-reference.json        # Links labels to image files
└── images/                     # Generated label images (SVG)
    ├── hoppy-trails-ipa.svg
    ├── reserve-cabernet-sauvignon.svg
    └── ...
```

### COLA Number Format

Generated COLA numbers follow the pattern: `COLA-YYYY-NNN`

- `YYYY`: Current year
- `NNN`: Sequential 3-digit number (starts at 1000)

Example: `COLA-2024-1000`, `COLA-2024-1001`, etc.

### Approval Dates

Randomly generated dates within the past 2 years from the current date.

## Realistic Test Data

### Brand Names by Type

**Beer Brands:**

- Hoppy Trails IPA
- Craft Lager Supreme
- IPA Masters
- Golden Ale Premium
- Dark Porter Reserve
- Session IPA
- Imperial Stout
- Lite Golden Lager
- New Release Ale
- Amber Wheat Beer

**Wine Brands:**

- Reserve Cabernet Sauvignon
- White Elegance Chardonnay
- Rose Garden Pinot Noir
- Barrel Oak Merlot
- Vintage Red Blend
- Estate Sauvignon Blanc

**Spirit Brands:**

- Kentucky Oak Bourbon
- Highland Single Malt
- Premium Vodka
- Aged Rum Reserve
- Silver Tequila

**Cider Brands:**

- Orchard Select Hard Cider
- Apple Valley Cider
- Pear Harvest Cider

### Generated Label Structure

```json
{
  "id": "uuid-v4",
  "brandName": "Hoppy Trails IPA",
  "alcoholByVolume": 6.5,
  "netContents": "12 fl oz (355 mL)",
  "governmentWarning": "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.",
  "classType": "beer",
  "producerName": "Mountain View Brewery",
  "imageUrl": "/test-images/hoppy-trails-ipa.jpg",
  "extractedText": null,
  "createdAt": "2024-01-20T10:30:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z"
}
```

### Generated Application Structure

```json
{
  "id": "uuid-v4",
  "brandName": "Hoppy Trails IPA",
  "alcoholByVolume": 6.5,
  "netContents": "12 fl oz (355 mL)",
  "producerName": "Mountain View Brewery",
  "colaNumber": "COLA-2024-1000",
  "approvalDate": "2023-06-15T00:00:00.000Z",
  "createdAt": "2024-01-20T10:30:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z"
}
```

## Label Image Generation

### SVG Format

Generated images are:

- **800×1200 pixels** (standard label size)
- **TTB-compliant layout** with proper warnings
- **Text-based** showing all key information:
  - Brand name (large, centered)
  - Alcohol class type
  - ABV percentage
  - Net contents
  - Producer name
  - Government warning (small text at bottom)

### Styling

- Beige background (#f5f5dc)
- Brown border and accents (#8b4513)
- Professional serif/sans-serif fonts
- Realistic label appearance

## Integration with Application

### Seed Test Data on API Startup

```typescript
// In your NestJS application service
import { TestDataGenerator } from '@ttb/test-data-generator';

async seedTestData() {
  const applications = TestDataGenerator.generateRealisticApplications(10);

  applications.forEach(app => {
    this.applicationsMap.set(app.id, app);
  });

  console.log(`Seeded ${applications.length} test applications`);
}
```

### Generate Test Images for Public Directory

```typescript
import { generatePublicTestImages } from '@ttb/test-data-generator';

// Generate images for apps/web/public/test-images
await generatePublicTestImages(path.join(__dirname, '../../../apps/web'));
```

## Testing Scenarios

### Validation Success (Matching)

```typescript
const { label, application } = TestDataGenerator.generateMatchingPair();
// Use for testing successful validation
```

### Validation Failure (Mismatch)

```typescript
const { label, application } = TestDataGenerator.generateMismatchedPair();
// Brand name differs, ABV differs
```

### Edge Case (Partial Match)

```typescript
const { label, application } = TestDataGenerator.generatePartialMatchPair();
// Same brand/producer, but ABV within 0.3% tolerance
```

## Best Practices

1. **Use Realistic Applications** for seeding the database:

   ```typescript
   TestDataGenerator.generateRealisticApplications(20);
   ```

2. **Generate Images** for visual testing:

   ```bash
   npx ttb-generate-test-data --count 15 --with-images
   ```

3. **Create Test Pairs** for validation testing:

   ```typescript
   const testCases = [
     ...Array(5)
       .fill(null)
       .map(() => TestDataGenerator.generateMatchingPair()),
     ...Array(5)
       .fill(null)
       .map(() => TestDataGenerator.generateMismatchedPair()),
     ...Array(3)
       .fill(null)
       .map(() => TestDataGenerator.generatePartialMatchPair()),
   ];
   ```

4. **Override Specific Fields** when you need controlled test data:
   ```typescript
   const label = TestDataGenerator.generateTestLabel({
     alcoholByVolume: 105, // Invalid ABV for testing error handling
   });
   ```

## See Also

- [Test Data Documentation](../../../docs/TEST_DATA.md) - Comprehensive testing guide
- [Testing Documentation](../../../docs/TESTING.md) - Testing procedures
- [Quick Test Reference](../../api/src/app/fixtures/quick-test-reference.ts) - Copy-paste test values
