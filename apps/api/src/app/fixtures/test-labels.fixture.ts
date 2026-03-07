import { LabelData, ExtractedLabelData } from '@ttb/shared-types';

/**
 * Test Label Fixtures
 * Sample label data with matching/mismatching application scenarios
 */

export interface TestLabelScenario {
  name: string;
  description: string;
  label: Partial<LabelData>;
  extractedData: ExtractedLabelData;
  matchingColaNumber?: string;
  expectedValidation: 'match' | 'mismatch' | 'partial';
  notes?: string;
}

/**
 * POSITIVE MATCHING LABELS
 * These labels should match their corresponding applications exactly
 */
export const MATCHING_LABEL_SCENARIOS: TestLabelScenario[] = [
  {
    name: 'Matching IPA Label',
    description: 'Label data that exactly matches COLA-2024-001 application',
    label: {
      imageUrl: '/test-images/hoppy-trails-ipa.jpg',
      processingStatus: 'completed',
    },
    extractedData: {
      brandName: 'Hoppy Trails IPA',
      alcoholByVolume: 6.5,
      netContents: '12 fl oz (355 mL)',
      producerName: 'Mountain View Brewery',
      warnings: [],
      governmentWarning: true,
      surgeonGeneralWarning: true,
      allergenStatement: 'Contains: Barley',
    },
    matchingColaNumber: 'COLA-2024-001',
    expectedValidation: 'match',
    notes: 'Perfect match for IPA application',
  },
  {
    name: 'Matching Wine Label',
    description: 'Label data that exactly matches COLA-2024-002 application',
    label: {
      imageUrl: '/test-images/reserve-cabernet.jpg',
      processingStatus: 'completed',
    },
    extractedData: {
      brandName: 'Reserve Cabernet Sauvignon',
      alcoholByVolume: 13.5,
      netContents: '750 mL',
      producerName: 'Valley Vineyards',
      warnings: [],
      governmentWarning: true,
      surgeonGeneralWarning: true,
      sulfiteStatement: 'Contains Sulfites',
    },
    matchingColaNumber: 'COLA-2024-002',
    expectedValidation: 'match',
    notes: 'Perfect match for wine application',
  },
  {
    name: 'Matching Bourbon Label',
    description: 'Label data that exactly matches COLA-2024-003 application',
    label: {
      imageUrl: '/test-images/kentucky-oak-bourbon.jpg',
      processingStatus: 'completed',
    },
    extractedData: {
      brandName: 'Kentucky Oak Bourbon',
      alcoholByVolume: 42.0,
      netContents: '750 mL',
      producerName: 'Heritage Distillery Co.',
      warnings: [],
      governmentWarning: true,
      surgeonGeneralWarning: true,
    },
    matchingColaNumber: 'COLA-2024-003',
    expectedValidation: 'match',
    notes: 'Perfect match for bourbon application',
  },
];

/**
 * NEGATIVE MISMATCHING LABELS
 * These labels have discrepancies with their applications
 */
export const MISMATCHING_LABEL_SCENARIOS: TestLabelScenario[] = [
  {
    name: 'Brand Name Mismatch',
    description: 'Label brand differs from application',
    label: {
      imageUrl: '/test-images/different-brand.jpg',
      processingStatus: 'completed',
    },
    extractedData: {
      brandName: 'Different IPA Name',
      alcoholByVolume: 6.5,
      netContents: '12 fl oz (355 mL)',
      producerName: 'Mountain View Brewery',
      warnings: ['Brand name does not match COLA application'],
      governmentWarning: true,
      surgeonGeneralWarning: true,
    },
    matchingColaNumber: 'COLA-2024-001',
    expectedValidation: 'mismatch',
    notes: 'Brand name differs from approved application',
  },
  {
    name: 'ABV Mismatch',
    description: 'Label ABV differs from application by more than 0.3%',
    label: {
      imageUrl: '/test-images/wrong-abv.jpg',
      processingStatus: 'completed',
    },
    extractedData: {
      brandName: 'Hoppy Trails IPA',
      alcoholByVolume: 7.2,
      netContents: '12 fl oz (355 mL)',
      producerName: 'Mountain View Brewery',
      warnings: ['ABV differs from COLA application by 0.7%'],
      governmentWarning: true,
      surgeonGeneralWarning: true,
    },
    matchingColaNumber: 'COLA-2024-001',
    expectedValidation: 'mismatch',
    notes: 'ABV exceeds tolerance threshold (>0.3% difference)',
  },
  {
    name: 'Net Contents Mismatch',
    description: 'Label container size differs from application',
    label: {
      imageUrl: '/test-images/wrong-size.jpg',
      processingStatus: 'completed',
    },
    extractedData: {
      brandName: 'Reserve Cabernet Sauvignon',
      alcoholByVolume: 13.5,
      netContents: '375 mL',
      producerName: 'Valley Vineyards',
      warnings: ['Container size does not match COLA application'],
      governmentWarning: true,
      surgeonGeneralWarning: true,
    },
    matchingColaNumber: 'COLA-2024-002',
    expectedValidation: 'mismatch',
    notes: 'Half bottle size when application specifies full bottle',
  },
  {
    name: 'Producer Name Mismatch',
    description: 'Label producer differs from application',
    label: {
      imageUrl: '/test-images/wrong-producer.jpg',
      processingStatus: 'completed',
    },
    extractedData: {
      brandName: 'Kentucky Oak Bourbon',
      alcoholByVolume: 42.0,
      netContents: '750 mL',
      producerName: 'Different Distillery Inc.',
      warnings: ['Producer name does not match COLA application'],
      governmentWarning: true,
      surgeonGeneralWarning: true,
    },
    matchingColaNumber: 'COLA-2024-003',
    expectedValidation: 'mismatch',
    notes: 'Unauthorized producer name on label',
  },
  {
    name: 'Missing Government Warning',
    description: 'Required warning statement not present',
    label: {
      imageUrl: '/test-images/missing-warning.jpg',
      processingStatus: 'completed',
    },
    extractedData: {
      brandName: 'Hoppy Trails IPA',
      alcoholByVolume: 6.5,
      netContents: '12 fl oz (355 mL)',
      producerName: 'Mountain View Brewery',
      warnings: ['Missing required government warning statement'],
      governmentWarning: false,
      surgeonGeneralWarning: true,
    },
    matchingColaNumber: 'COLA-2024-001',
    expectedValidation: 'mismatch',
    notes: 'TTB requires government warning on all labels',
  },
];

/**
 * PARTIAL MATCH SCENARIOS
 * Minor discrepancies that may be acceptable with review
 */
export const PARTIAL_MATCH_SCENARIOS: TestLabelScenario[] = [
  {
    name: 'Minor ABV Variation',
    description: 'ABV within tolerance (≤0.3%)',
    label: {
      imageUrl: '/test-images/minor-abv-diff.jpg',
      processingStatus: 'completed',
    },
    extractedData: {
      brandName: 'Hoppy Trails IPA',
      alcoholByVolume: 6.3,
      netContents: '12 fl oz (355 mL)',
      producerName: 'Mountain View Brewery',
      warnings: ['ABV differs by 0.2% - within acceptable tolerance'],
      governmentWarning: true,
      surgeonGeneralWarning: true,
    },
    matchingColaNumber: 'COLA-2024-001',
    expectedValidation: 'partial',
    notes: 'Small ABV difference within TTB tolerance',
  },
  {
    name: 'Alternative Brand Name Format',
    description: 'Brand name with minor formatting difference',
    label: {
      imageUrl: '/test-images/alt-brand-format.jpg',
      processingStatus: 'completed',
    },
    extractedData: {
      brandName: 'Reserve Cabernet',
      alcoholByVolume: 13.5,
      netContents: '750 mL',
      producerName: 'Valley Vineyards',
      warnings: ['Brand name shortened - verify against approved label'],
      governmentWarning: true,
      surgeonGeneralWarning: true,
    },
    matchingColaNumber: 'COLA-2024-002',
    expectedValidation: 'partial',
    notes: 'Partial brand name may be acceptable',
  },
];

/**
 * Get all test label scenarios
 */
export function getAllLabelScenarios(): TestLabelScenario[] {
  return [...MATCHING_LABEL_SCENARIOS, ...MISMATCHING_LABEL_SCENARIOS, ...PARTIAL_MATCH_SCENARIOS];
}

/**
 * Get scenarios by expected validation result
 */
export function getLabelScenariosByValidation(
  validationType: 'match' | 'mismatch' | 'partial'
): TestLabelScenario[] {
  return getAllLabelScenarios().filter(
    (scenario) => scenario.expectedValidation === validationType
  );
}

/**
 * Get scenario for a specific COLA number
 */
export function getLabelScenariosForCola(colaNumber: string): TestLabelScenario[] {
  return getAllLabelScenarios().filter((scenario) => scenario.matchingColaNumber === colaNumber);
}
