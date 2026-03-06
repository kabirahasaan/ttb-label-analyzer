import { LabelData, ApplicationData } from '@ttb/shared-types';
import { faker } from '@faker-js/faker';

/**
 * Test Data Generator
 * Generates synthetic label and application data for testing
 */
export class TestDataGenerator {
  private static readonly beerBrands = [
    'Craft Lager',
    'IPA Masters',
    'Hoppy Hour',
    'Golden Ale',
    'Dark Porter',
  ];
  private static readonly wineBrands = [
    'Red Reserve',
    'White Elegance',
    'Rose Garden',
    'Barrel Oak',
  ];
  private static readonly producers = [
    'Brewery Co.',
    'Winery Group',
    'Distillery Inc.',
    'Spirit House',
  ];
  private static readonly alcoholTypes = ['beer', 'wine', 'distilled spirit', 'mead', 'cider'];

  static generateTestLabel(overrides?: Partial<LabelData>): LabelData {
    const type = this.pickRandomItem(this.alcoholTypes);
    const brand =
      type === 'wine' ? this.pickRandomItem(this.wineBrands) : this.pickRandomItem(this.beerBrands);

    return {
      id: faker.string.uuid(),
      brandName: overrides?.brandName || brand,
      alcoholByVolume:
        overrides?.alcoholByVolume ||
        (type === 'beer'
          ? faker.number.float({ min: 3, max: 10, precision: 0.1 })
          : type === 'wine'
            ? faker.number.float({ min: 10, max: 15, precision: 0.1 })
            : faker.number.float({ min: 35, max: 45, precision: 0.1 })),
      netContents:
        overrides?.netContents ||
        (type === 'beer'
          ? `${faker.number.int({ min: 8, max: 16 })} fl oz (${faker.number.int({ min: 236, max: 473 })} mL)`
          : `${faker.number.int({ min: 500, max: 1500 })} mL`),
      governmentWarning:
        overrides?.governmentWarning ||
        'GOVERNMENT WARNING: According to the Surgeon General, women should not drink alcoholic beverages during pregnancy...',
      classType: overrides?.classType || type,
      producerName: overrides?.producerName || this.pickRandomItem(this.producers),
      imageUrl: overrides?.imageUrl || faker.image.url(),
      extractedText: overrides?.extractedText,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static generateTestApplication(overrides?: Partial<ApplicationData>): ApplicationData {
    const label = this.generateTestLabel(overrides);

    return {
      id: faker.string.uuid(),
      brandName: overrides?.brandName || label.brandName,
      alcoholByVolume: overrides?.alcoholByVolume || label.alcoholByVolume,
      netContents: overrides?.netContents || label.netContents,
      producerName: overrides?.producerName || label.producerName,
      colaNumber: overrides?.colaNumber || `COLA-${faker.string.alphaNumeric(6).toUpperCase()}`,
      approvalDate: overrides?.approvalDate || new Date(Date.now() - 3600 * 24 * 30 * 1000), // 30 days ago
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static generateMatchingPair(): {
    label: LabelData;
    application: ApplicationData;
  } {
    const label = this.generateTestLabel();
    const application: ApplicationData = {
      id: faker.string.uuid(),
      brandName: label.brandName,
      alcoholByVolume: label.alcoholByVolume,
      netContents: label.netContents,
      producerName: label.producerName,
      colaNumber: `COLA-${faker.string.alphaNumeric(6).toUpperCase()}`,
      approvalDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return { label, application };
  }

  static generateMismatchedPair(): {
    label: LabelData;
    application: ApplicationData;
  } {
    const label = this.generateTestLabel();
    const application = this.generateTestApplication({
      brandName: `${label.brandName} - Different`,
      alcoholByVolume: (label.alcoholByVolume || 0) + 2,
    });

    return { label, application };
  }

  static generateBatch(count: number): LabelData[] {
    return Array.from({ length: count }, () => this.generateTestLabel());
  }

  static generateApplicationBatch(count: number): ApplicationData[] {
    return Array.from({ length: count }, () => this.generateTestApplication());
  }

  private static pickRandomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }
}
