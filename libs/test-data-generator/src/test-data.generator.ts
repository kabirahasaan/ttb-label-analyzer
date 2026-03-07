import { LabelData, ApplicationData } from '@ttb/shared-types';
import { randomUUID } from 'crypto';
const ALCOHOL_TYPES = ['beer', 'wine', 'distilled spirit', 'cider'] as const;
export type AlcoholType = (typeof ALCOHOL_TYPES)[number];

/**
 * Enhanced Test Data Generator
 * Generates realistic synthetic label and application data for end-to-end testing
 */
export class TestDataGenerator {
  // Beer brands
  private static readonly beerBrands = [
    'Hoppy Trails IPA',
    'Craft Lager Supreme',
    'IPA Masters',
    'Golden Ale Premium',
    'Dark Porter Reserve',
    'Session IPA',
    'Imperial Stout',
    'Lite Golden Lager',
    'New Release Ale',
    'Amber Wheat Beer',
  ];

  // Wine brands
  private static readonly wineBrands = [
    'Reserve Cabernet Sauvignon',
    'White Elegance Chardonnay',
    'Rose Garden Pinot Noir',
    'Barrel Oak Merlot',
    'Vintage Red Blend',
    'Estate Sauvignon Blanc',
  ];

  // Spirit brands
  private static readonly spiritBrands = [
    'Kentucky Oak Bourbon',
    'Highland Single Malt',
    'Premium Vodka',
    'Aged Rum Reserve',
    'Silver Tequila',
  ];

  // Cider brands
  private static readonly ciderBrands = [
    'Orchard Select Hard Cider',
    'Apple Valley Cider',
    'Pear Harvest Cider',
  ];

  // Beer producers
  private static readonly beerProducers = [
    'Mountain View Brewery',
    'Sunrise Brewing Company',
    'Craft Masters Brewery',
    'Modern Brewing',
    'Fresh Hops Brewing',
    'Boutique Brewery',
  ];

  // Wine producers
  private static readonly wineProducers = [
    'Valley Vineyards',
    'Estate Winery',
    'Hillside Vineyard',
    'Coastal Wine Co.',
  ];

  // Spirit producers
  private static readonly spiritProducers = [
    'Heritage Distillery Co.',
    'Artisan Distillers',
    'Premium Spirits Inc.',
  ];

  // Cider producers
  private static readonly ciderProducers = ['Apple Valley Cidery', 'Orchard Cider Works'];

  private static colaCounter = 1000;

  /**
   * Generate a test label with realistic data
   */
  static generateTestLabel(overrides?: Partial<LabelData>): LabelData {
    const type = this.pickRandomItem([...ALCOHOL_TYPES]) as AlcoholType;
    const brand = this.getBrandForType(type);
    const producer = this.getProducerForType(type);
    const abv = this.getABVForType(type);
    const contents = this.getContentsForType(type);

    return {
      id: randomUUID(),
      brandName: overrides?.brandName || brand,
      alcoholByVolume: overrides?.alcoholByVolume || abv,
      netContents: overrides?.netContents || contents,
      governmentWarning:
        overrides?.governmentWarning ||
        'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.',
      classType: overrides?.classType || type,
      producerName: overrides?.producerName || producer,
      imageUrl: overrides?.imageUrl || `/test-images/${this.slugify(brand)}.jpg`,
      extractedText: overrides?.extractedText,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Generate a test application with realistic data
   */
  static generateTestApplication(overrides?: Partial<ApplicationData>): ApplicationData {
    const type = this.pickRandomItem([...ALCOHOL_TYPES]) as AlcoholType;
    const brand = this.getBrandForType(type);
    const producer = this.getProducerForType(type);
    const abv = this.getABVForType(type);
    const contents = this.getContentsForType(type);

    return {
      id: randomUUID(),
      brandName: overrides?.brandName || brand,
      alcoholByVolume: overrides?.alcoholByVolume || abv,
      netContents: overrides?.netContents || contents,
      producerName: overrides?.producerName || producer,
      governmentWarning:
        overrides?.governmentWarning ||
        'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.',
      colaNumber: overrides?.colaNumber || this.generateColaNumber(),
      approvalDate: overrides?.approvalDate || this.generateApprovalDate(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Generate a matching label and application pair
   */
  static generateMatchingPair(): {
    label: LabelData;
    application: ApplicationData;
  } {
    const application = this.generateTestApplication();
    const label = this.generateTestLabel({
      brandName: application.brandName,
      alcoholByVolume: application.alcoholByVolume,
      netContents: application.netContents,
      producerName: application.producerName,
    });

    return { label, application };
  }

  /**
   * Generate a mismatched label and application pair
   */
  static generateMismatchedPair(): {
    label: LabelData;
    application: ApplicationData;
  } {
    const application = this.generateTestApplication();
    const label = this.generateTestLabel({
      brandName: `${application.brandName} - Different Brand`,
      alcoholByVolume: application.alcoholByVolume + 2,
    });

    return { label, application };
  }

  /**
   * Generate a partial match pair (minor ABV difference within tolerance)
   */
  static generatePartialMatchPair(): {
    label: LabelData;
    application: ApplicationData;
  } {
    const application = this.generateTestApplication();
    const label = this.generateTestLabel({
      brandName: application.brandName,
      alcoholByVolume: application.alcoholByVolume + 0.2, // Within 0.3% tolerance
      netContents: application.netContents,
      producerName: application.producerName,
    });

    return { label, application };
  }

  /**
   * Generate batch of labels
   */
  static generateBatch(count: number): LabelData[] {
    return Array.from({ length: count }, () => this.generateTestLabel());
  }

  /**
   * Generate batch of applications
   */
  static generateApplicationBatch(count: number): ApplicationData[] {
    return Array.from({ length: count }, () => this.generateTestApplication());
  }

  /**
   * Generate realistic test applications similar to fixtures
   */
  static generateRealisticApplications(count: number = 10): ApplicationData[] {
    const applications: ApplicationData[] = [];
    const types = ALCOHOL_TYPES;

    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const brand = this.getBrandForType(type);
      const producer = this.getProducerForType(type);
      const abv = this.getABVForType(type);
      const contents = this.getContentsForType(type);

      applications.push({
        id: randomUUID(),
        brandName: brand,
        alcoholByVolume: abv,
        netContents: contents,
        producerName: producer,
        governmentWarning:
          'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.',
        colaNumber: this.generateColaNumber(),
        approvalDate: this.generateApprovalDate(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return applications;
  }

  /**
   * Get brand name for alcohol type
   */
  private static getBrandForType(type: AlcoholType): string {
    switch (type) {
      case 'beer':
        return this.pickRandomItem(this.beerBrands);
      case 'wine':
        return this.pickRandomItem(this.wineBrands);
      case 'distilled spirit':
        return this.pickRandomItem(this.spiritBrands);
      case 'cider':
        return this.pickRandomItem(this.ciderBrands);
      default:
        return this.pickRandomItem(this.beerBrands);
    }
  }

  /**
   * Get producer name for alcohol type
   */
  private static getProducerForType(type: AlcoholType): string {
    switch (type) {
      case 'beer':
        return this.pickRandomItem(this.beerProducers);
      case 'wine':
        return this.pickRandomItem(this.wineProducers);
      case 'distilled spirit':
        return this.pickRandomItem(this.spiritProducers);
      case 'cider':
        return this.pickRandomItem(this.ciderProducers);
      default:
        return this.pickRandomItem(this.beerProducers);
    }
  }

  /**
   * Get ABV for alcohol type with realistic ranges
   */
  private static getABVForType(type: AlcoholType): number {
    switch (type) {
      case 'beer':
        return this.randomFloat(3.0, 12.0, 1);
      case 'wine':
        return this.randomFloat(11.0, 15.0, 1);
      case 'distilled spirit':
        return this.randomFloat(35.0, 50.0, 1);
      case 'cider':
        return this.randomFloat(4.0, 8.0, 1);
      default:
        return 5.0;
    }
  }

  /**
   * Get container size for alcohol type
   */
  private static getContentsForType(type: AlcoholType): string {
    switch (type) {
      case 'beer':
      case 'cider':
        const beerSizes = ['12 fl oz (355 mL)', '16 fl oz (473 mL)', '12 fl oz'];
        return this.pickRandomItem(beerSizes);
      case 'wine':
        const wineSizes = ['750 mL', '375 mL', '1.5 L'];
        return this.pickRandomItem(wineSizes);
      case 'distilled spirit':
        const spiritSizes = ['750 mL', '1 L', '1.75 L'];
        return this.pickRandomItem(spiritSizes);
      default:
        return '355 mL';
    }
  }

  /**
   * Generate TTB COLA ID in format COLA-YYYY-NNN
   */
  private static generateColaNumber(): string {
    const year = new Date().getFullYear();
    const num = String(this.colaCounter++).padStart(3, '0');
    return `COLA-${year}-${num}`;
  }

  /**
   * Generate approval date (random date in past 2 years)
   */
  private static generateApprovalDate(): Date {
    const now = Date.now();
    const twoYearsAgo = now - 730 * 24 * 60 * 60 * 1000;
    const randomTime = twoYearsAgo + Math.random() * (now - twoYearsAgo);
    return new Date(randomTime);
  }

  /**
   * Convert string to slug for file names
   */
  private static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Pick random item from array
   */
  private static pickRandomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  private static randomFloat(min: number, max: number, fractionDigits: number): number {
    const value = min + Math.random() * (max - min);
    return Number(value.toFixed(fractionDigits));
  }
}
