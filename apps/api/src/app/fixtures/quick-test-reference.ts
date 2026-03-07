/**
 * Quick Test Data Reference
 * Copy-paste values for manual testing
 */

export const QUICK_TEST_DATA = {
  // ========================================
  // POSITIVE TEST: Should Pass All Checks
  // ========================================
  positiveMatch: {
    colaNumber: 'COLA-2024-001',
    brandName: 'Hoppy Trails IPA',
    abv: '6.5',
    netContents: '12 fl oz (355 mL)',
    producer: 'Mountain View Brewery',
    expectedResult: '✅ All validations pass',
  },

  // ========================================
  // NEGATIVE TEST: Brand Name Mismatch
  // ========================================
  brandMismatch: {
    colaNumber: 'COLA-2024-001',
    brandName: 'Different IPA Name',
    abv: '6.5',
    netContents: '12 fl oz (355 mL)',
    producer: 'Mountain View Brewery',
    expectedResult: '❌ Brand name does not match',
  },

  // ========================================
  // NEGATIVE TEST: ABV Out of Tolerance
  // ========================================
  abvMismatch: {
    colaNumber: 'COLA-2024-001',
    brandName: 'Hoppy Trails IPA',
    abv: '7.2',
    netContents: '12 fl oz (355 mL)',
    producer: 'Mountain View Brewery',
    expectedResult: '❌ ABV differs by 0.7% (exceeds tolerance)',
  },

  // ========================================
  // NEGATIVE TEST: Container Size Mismatch
  // ========================================
  contentsMismatch: {
    colaNumber: 'COLA-2024-002',
    brandName: 'Reserve Cabernet Sauvignon',
    abv: '13.5',
    netContents: '375 mL',
    producer: 'Valley Vineyards',
    expectedResult: '❌ Container size does not match',
  },

  // ========================================
  // PARTIAL MATCH: Minor ABV Within Tolerance
  // ========================================
  minorAbvDifference: {
    colaNumber: 'COLA-2024-001',
    brandName: 'Hoppy Trails IPA',
    abv: '6.3',
    netContents: '12 fl oz (355 mL)',
    producer: 'Mountain View Brewery',
    expectedResult: '⚠️ Warning - ABV differs by 0.2% (acceptable)',
  },

  // ========================================
  // Available Test Applications
  // ========================================
  availableApplications: [
    'COLA-2024-001 - Hoppy Trails IPA (6.5% ABV)',
    'COLA-2024-002 - Reserve Cabernet Sauvignon (13.5% ABV)',
    'COLA-2024-003 - Kentucky Oak Bourbon (42% ABV)',
    'COLA-2024-004 - Lite Golden Lager (4.2% ABV)',
    'COLA-2024-005 - Orchard Select Hard Cider (5.8% ABV)',
  ],
};

/**
 * Test Scenario Templates
 * Use these for structured testing
 */
export const TEST_SCENARIOS = {
  scenario1_perfectMatch: {
    name: 'Perfect Match Validation',
    steps: [
      '1. Navigate to Validate Label page',
      '2. Upload any test image',
      '3. Select or enter: COLA-2024-001',
      '4. Enter Brand: Hoppy Trails IPA',
      '5. Enter ABV: 6.5',
      '6. Enter Contents: 12 fl oz (355 mL)',
      '7. Enter Producer: Mountain View Brewery',
      '8. Click Run Validation',
    ],
    expected: '✅ All validation checks should pass',
  },

  scenario2_brandMismatch: {
    name: 'Brand Name Error Detection',
    steps: [
      '1. Navigate to Validate Label page',
      '2. Upload any test image',
      '3. Select or enter: COLA-2024-001',
      '4. Enter Brand: Different IPA Name',
      '5. Enter ABV: 6.5',
      '6. Enter Contents: 12 fl oz (355 mL)',
      '7. Enter Producer: Mountain View Brewery',
      '8. Click Run Validation',
    ],
    expected: '❌ Should show brand name mismatch error',
  },

  scenario3_abvTolerance: {
    name: 'ABV Tolerance Check',
    steps: [
      '1. Navigate to Validate Label page',
      '2. Upload any test image',
      '3. Select or enter: COLA-2024-001',
      '4. Enter Brand: Hoppy Trails IPA',
      '5. Enter ABV: 6.3 (0.2% under)',
      '6. Enter Contents: 12 fl oz (355 mL)',
      '7. Enter Producer: Mountain View Brewery',
      '8. Click Run Validation',
    ],
    expected: '⚠️ Should show warning but allow pass (within tolerance)',
  },

  scenario4_multipleErrors: {
    name: 'Multiple Validation Errors',
    steps: [
      '1. Navigate to Validate Label page',
      '2. Upload any test image',
      '3. Select or enter: COLA-2024-001',
      '4. Enter Brand: Wrong Brand',
      '5. Enter ABV: 7.5',
      '6. Enter Contents: 16 fl oz',
      '7. Enter Producer: Different Brewery',
      '8. Click Run Validation',
    ],
    expected: '❌ Should show multiple errors: brand, ABV, contents, producer',
  },

  scenario5_wineValidation: {
    name: 'Wine Label Validation',
    steps: [
      '1. Navigate to Validate Label page',
      '2. Upload any test image',
      '3. Select or enter: COLA-2024-002',
      '4. Enter Brand: Reserve Cabernet Sauvignon',
      '5. Enter ABV: 13.5',
      '6. Enter Contents: 750 mL',
      '7. Enter Producer: Valley Vineyards',
      '8. Click Run Validation',
    ],
    expected: '✅ Wine validation should pass with sulfite check',
  },

  scenario6_spiritValidation: {
    name: 'High-ABV Spirit Validation',
    steps: [
      '1. Navigate to Validate Label page',
      '2. Upload any test image',
      '3. Select or enter: COLA-2024-003',
      '4. Enter Brand: Kentucky Oak Bourbon',
      '5. Enter ABV: 42',
      '6. Enter Contents: 750 mL',
      '7. Enter Producer: Heritage Distillery Co.',
      '8. Click Run Validation',
    ],
    expected: '✅ Spirit validation should pass',
  },
};

export default QUICK_TEST_DATA;
