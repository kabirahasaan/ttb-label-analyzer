import { ApplicationData } from '@ttb/shared-types';

/**
 * Test Application Fixtures
 * Organized test data for positive and negative validation scenarios
 */

const GOVERNMENT_WARNING_TEXT =
  'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.';

export interface TestScenario {
  name: string;
  description: string;
  application: Omit<ApplicationData, 'id' | 'createdAt' | 'updatedAt'>;
  expectedValidation: 'valid' | 'warning' | 'error';
  notes?: string;
}

/**
 * POSITIVE TEST CASES - Should pass validation
 */
export const POSITIVE_TEST_APPLICATIONS: TestScenario[] = [
  {
    name: 'Valid Beer - IPA',
    description: 'Standard craft beer with all required fields',
    application: {
      brandName: 'Hoppy Trails IPA',
      alcoholByVolume: 6.5,
      netContents: '12 fl oz (355 mL)',
      producerName: 'Mountain View Brewery',
      governmentWarning: GOVERNMENT_WARNING_TEXT,
      colaNumber: 'COLA-2024-001',
      approvalDate: new Date('2024-01-15'),
    },
    expectedValidation: 'valid',
    notes: 'Standard compliant beer label',
  },
  {
    name: 'Valid Wine - Cabernet',
    description: 'Wine with proper ABV range',
    application: {
      brandName: 'Reserve Cabernet Sauvignon',
      alcoholByVolume: 13.5,
      netContents: '750 mL',
      producerName: 'Valley Vineyards',
      governmentWarning: GOVERNMENT_WARNING_TEXT,
      colaNumber: 'COLA-2024-002',
      approvalDate: new Date('2024-02-01'),
    },
    expectedValidation: 'valid',
    notes: 'Standard wine within TTB guidelines',
  },
  {
    name: 'Valid Spirit - Bourbon',
    description: 'Distilled spirit with high ABV',
    application: {
      brandName: 'Kentucky Oak Bourbon',
      alcoholByVolume: 42.0,
      netContents: '750 mL',
      producerName: 'Heritage Distillery Co.',
      governmentWarning: GOVERNMENT_WARNING_TEXT,
      colaNumber: 'COLA-2024-003',
      approvalDate: new Date('2024-01-20'),
    },
    expectedValidation: 'valid',
    notes: 'Compliant distilled spirit',
  },
  {
    name: 'Valid Light Beer',
    description: 'Lower ABV beer',
    application: {
      brandName: 'Lite Golden Lager',
      alcoholByVolume: 4.2,
      netContents: '12 fl oz (355 mL)',
      producerName: 'Sunrise Brewing Company',
      governmentWarning: GOVERNMENT_WARNING_TEXT,
      colaNumber: 'COLA-2024-004',
      approvalDate: new Date('2024-03-01'),
    },
    expectedValidation: 'valid',
  },
  {
    name: 'Valid Craft Cider',
    description: 'Apple cider product',
    application: {
      brandName: 'Orchard Select Hard Cider',
      alcoholByVolume: 5.8,
      netContents: '12 fl oz (355 mL)',
      producerName: 'Apple Valley Cidery',
      governmentWarning: GOVERNMENT_WARNING_TEXT,
      colaNumber: 'COLA-2024-005',
      approvalDate: new Date('2024-02-15'),
    },
    expectedValidation: 'valid',
  },
];

/**
 * NEGATIVE TEST CASES - Should fail or warn validation
 */
export const NEGATIVE_TEST_APPLICATIONS: TestScenario[] = [
  {
    name: 'Invalid ABV - Too Low',
    description: 'ABV below minimum threshold',
    application: {
      brandName: 'Non-Alcoholic Beer',
      alcoholByVolume: 0.5,
      netContents: '12 fl oz',
      producerName: 'Test Brewery',
      governmentWarning: GOVERNMENT_WARNING_TEXT,
      colaNumber: 'COLA-INVALID-001',
      approvalDate: new Date(),
    },
    expectedValidation: 'warning',
    notes: 'May not require COLA approval',
  },
  {
    name: 'Invalid ABV - Unrealistic High',
    description: 'ABV exceeds reasonable limits',
    application: {
      brandName: 'Super Strong Spirit',
      alcoholByVolume: 95.0,
      netContents: '750 mL',
      producerName: 'Test Distillery',
      governmentWarning: GOVERNMENT_WARNING_TEXT,
      colaNumber: 'COLA-INVALID-002',
      approvalDate: new Date(),
    },
    expectedValidation: 'warning',
    notes: 'Unusually high ABV may require special handling',
  },
  {
    name: 'Mismatched Product Type',
    description: 'Beer ABV but wine-style naming',
    application: {
      brandName: 'Chardonnay Reserve',
      alcoholByVolume: 5.5,
      netContents: '355 mL',
      producerName: 'Confused Producer Inc.',
      governmentWarning: GOVERNMENT_WARNING_TEXT,
      colaNumber: 'COLA-INVALID-003',
      approvalDate: new Date(),
    },
    expectedValidation: 'warning',
    notes: 'Name suggests wine but ABV suggests beer',
  },
  {
    name: 'Missing COLA Number',
    description: 'Application without COLA number',
    application: {
      brandName: 'Test Product',
      alcoholByVolume: 6.0,
      netContents: '12 fl oz',
      producerName: 'Test Producer',
      governmentWarning: GOVERNMENT_WARNING_TEXT,
      approvalDate: new Date(),
    },
    expectedValidation: 'warning',
    notes: 'Missing COLA identifier',
  },
  {
    name: 'Expired Approval',
    description: 'Old approval date',
    application: {
      brandName: 'Vintage Beer',
      alcoholByVolume: 5.5,
      netContents: '12 fl oz',
      producerName: 'Old Brewery',
      governmentWarning: GOVERNMENT_WARNING_TEXT,
      colaNumber: 'COLA-2010-999',
      approvalDate: new Date('2010-01-01'),
    },
    expectedValidation: 'warning',
    notes: 'Very old approval date may be expired',
  },
];

/**
 * EDGE CASE TEST SCENARIOS
 */
export const EDGE_CASE_APPLICATIONS: TestScenario[] = [
  {
    name: 'Minimum ABV Beer',
    description: 'Lowest acceptable beer ABV',
    application: {
      brandName: 'Session IPA',
      alcoholByVolume: 3.0,
      netContents: '12 fl oz',
      producerName: 'Modern Brewing',
      governmentWarning: GOVERNMENT_WARNING_TEXT,
      colaNumber: 'COLA-2024-100',
      approvalDate: new Date(),
    },
    expectedValidation: 'valid',
  },
  {
    name: 'Maximum Standard Beer ABV',
    description: 'High but acceptable beer ABV',
    application: {
      brandName: 'Imperial Stout',
      alcoholByVolume: 12.0,
      netContents: '12 fl oz',
      producerName: 'Craft Masters',
      governmentWarning: GOVERNMENT_WARNING_TEXT,
      colaNumber: 'COLA-2024-101',
      approvalDate: new Date(),
    },
    expectedValidation: 'valid',
  },
  {
    name: 'Unusual Container Size',
    description: 'Non-standard bottle size',
    application: {
      brandName: 'Special Release',
      alcoholByVolume: 7.5,
      netContents: '500 mL',
      producerName: 'Boutique Brewery',
      governmentWarning: GOVERNMENT_WARNING_TEXT,
      colaNumber: 'COLA-2024-102',
      approvalDate: new Date(),
    },
    expectedValidation: 'valid',
  },
  {
    name: 'Recent Approval',
    description: 'Just approved application',
    application: {
      brandName: 'New Release Ale',
      alcoholByVolume: 6.8,
      netContents: '16 fl oz',
      producerName: 'Fresh Hops Brewing',
      governmentWarning: GOVERNMENT_WARNING_TEXT,
      colaNumber: 'COLA-2024-103',
      approvalDate: new Date(),
    },
    expectedValidation: 'valid',
  },
];

/**
 * Get all test scenarios combined
 */
export function getAllTestScenarios(): TestScenario[] {
  return [...POSITIVE_TEST_APPLICATIONS, ...NEGATIVE_TEST_APPLICATIONS, ...EDGE_CASE_APPLICATIONS];
}

/**
 * Get only valid test applications
 */
export function getValidTestApplications(): TestScenario[] {
  return [...POSITIVE_TEST_APPLICATIONS, ...EDGE_CASE_APPLICATIONS].filter(
    (scenario) => scenario.expectedValidation === 'valid'
  );
}

/**
 * Get test applications that should trigger warnings
 */
export function getWarningTestApplications(): TestScenario[] {
  return NEGATIVE_TEST_APPLICATIONS.filter((scenario) => scenario.expectedValidation === 'warning');
}
