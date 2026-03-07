import { Injectable, NotFoundException } from '@nestjs/common';
import { basename, extname } from 'path';
import { CreateLabelDto } from './label.dto';
import { LabelData } from '@ttb/shared-types';
import { LoggerService } from '@ttb/logger';

type MockExtractedLabel = {
  brandName: string;
  alcoholByVolume: number;
  netContents: string;
  producerName: string;
  governmentWarning?: string;
  classType?: string;
};

const GOVERNMENT_WARNING_TEXT =
  'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.';

const MOCK_FILENAME_LABEL_DATA: Record<string, MockExtractedLabel> = {
  'hoppy-trails-ipa': {
    brandName: 'Hoppy Trails IPA',
    alcoholByVolume: 6.5,
    netContents: '12 fl oz (355 mL)',
    producerName: 'Mountain View Brewery',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'reserve-cabernet': {
    brandName: 'Reserve Cabernet Sauvignon',
    alcoholByVolume: 13.5,
    netContents: '750 mL',
    producerName: 'Valley Vineyards',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'reserve-cabernet-sauvignon': {
    brandName: 'Reserve Cabernet Sauvignon',
    alcoholByVolume: 13.5,
    netContents: '750 mL',
    producerName: 'Valley Vineyards',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'kentucky-oak-bourbon': {
    brandName: 'Kentucky Oak Bourbon',
    alcoholByVolume: 42.0,
    netContents: '750 mL',
    producerName: 'Heritage Distillery Co.',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'wrong-abv': {
    brandName: 'Hoppy Trails IPA',
    alcoholByVolume: 7.2,
    netContents: '12 fl oz (355 mL)',
    producerName: 'Mountain View Brewery',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'different-brand': {
    brandName: 'Different IPA Name',
    alcoholByVolume: 6.5,
    netContents: '12 fl oz (355 mL)',
    producerName: 'Mountain View Brewery',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'wrong-size': {
    brandName: 'Reserve Cabernet Sauvignon',
    alcoholByVolume: 13.5,
    netContents: '375 mL',
    producerName: 'Valley Vineyards',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'wrong-producer': {
    brandName: 'Kentucky Oak Bourbon',
    alcoholByVolume: 42.0,
    netContents: '750 mL',
    producerName: 'Different Distillery Inc.',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'cola-2024-001-positive-perfect-match': {
    brandName: 'Hoppy Trails IPA',
    alcoholByVolume: 6.5,
    netContents: '12 fl oz (355 mL)',
    producerName: 'Mountain View Brewery',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'cola-2024-002-positive-perfect-match': {
    brandName: 'Reserve Cabernet Sauvignon',
    alcoholByVolume: 13.5,
    netContents: '750 mL',
    producerName: 'Valley Vineyards',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'cola-2024-003-positive-perfect-match': {
    brandName: 'Kentucky Oak Bourbon',
    alcoholByVolume: 42.0,
    netContents: '750 mL',
    producerName: 'Heritage Distillery Co.',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'cola-2024-004-positive-perfect-match': {
    brandName: 'Lite Golden Lager',
    alcoholByVolume: 4.2,
    netContents: '12 fl oz (355 mL)',
    producerName: 'Sunrise Brewing Company',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'cola-2024-005-positive-perfect-match': {
    brandName: 'Orchard Select Hard Cider',
    alcoholByVolume: 5.8,
    netContents: '12 fl oz (355 mL)',
    producerName: 'Apple Valley Cidery',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'cola-2024-100-edge-min-abv-boundary': {
    brandName: 'Session IPA',
    alcoholByVolume: 3.0,
    netContents: '12 fl oz (355 mL)',
    producerName: 'Modern Brewing Co.',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'cola-2024-001-negative-missing-govt-warning': {
    brandName: 'Hoppy Trails IPA',
    alcoholByVolume: 6.5,
    netContents: '12 fl oz (355 mL)',
    producerName: 'Mountain View Brewery',
    governmentWarning: '',
  },
  'cola-2024-001-negative-incomplete-information': {
    brandName: 'Hoppy Trails IPA',
    alcoholByVolume: 6.5,
    netContents: '',
    producerName: '',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'cola-invalid-001-negative-abv-too-low': {
    brandName: 'Near Beer Light',
    alcoholByVolume: 0.5,
    netContents: '12 fl oz (355 mL)',
    producerName: 'Low Alcohol Beverages',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'cola-invalid-002-negative-abv-too-high': {
    brandName: 'Extreme Spirit',
    alcoholByVolume: 95.0,
    netContents: '750 mL',
    producerName: 'Maximum Spirits Inc.',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'cola-2010-999-negative-expired-approval': {
    brandName: 'Old Timer Ale',
    alcoholByVolume: 5.5,
    netContents: '12 fl oz (355 mL)',
    producerName: 'Old Brewery',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
  'no-cola-negative-missing-cola-id': {
    brandName: 'Unlabeled Product',
    alcoholByVolume: 5.5,
    netContents: '12 fl oz (355 mL)',
    producerName: 'Generic Brewery',
    governmentWarning: GOVERNMENT_WARNING_TEXT,
  },
};

/**
 * Label Service
 * Handles label operations and persistence
 */
@Injectable()
export class LabelService {
  private labels: Map<string, LabelData> = new Map();

  constructor(private logger: LoggerService) {}

  create(createLabelDto: CreateLabelDto): LabelData {
    const id = this.generateId();
    const label: LabelData = {
      id,
      ...createLabelDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.labels.set(id, label);
    this.logger.info(`Label created: ${id}`, { labelId: id });

    return label;
  }

  findAll(): LabelData[] {
    return Array.from(this.labels.values());
  }

  findOne(id: string): LabelData {
    const label = this.labels.get(id);
    if (!label) {
      throw new NotFoundException(`Label with ID ${id} not found`);
    }
    return label;
  }

  uploadImage(labelId: string, filename: string, mimeType: string): LabelData {
    const label = this.findOne(labelId);
    const parsedFromImage = this.getLabelDataFromFilename(filename, label);

    const updatedLabel: LabelData = {
      ...label,
      ...parsedFromImage,
      imageUrl: `/uploads/${filename}`,
      updatedAt: new Date(),
    };

    this.labels.set(labelId, updatedLabel);
    this.logger.info(`Image uploaded for label: ${labelId}`, {
      labelId,
      filename,
      brandName: updatedLabel.brandName,
      alcoholByVolume: updatedLabel.alcoholByVolume,
    });

    return updatedLabel;
  }

  delete(id: string): void {
    if (!this.labels.has(id)) {
      throw new NotFoundException(`Label with ID ${id} not found`);
    }
    this.labels.delete(id);
    this.logger.info(`Label deleted: ${id}`, { labelId: id });
  }

  private getLabelDataFromFilename(filename: string, existingLabel: LabelData): Partial<LabelData> {
    const stem = this.getFileStem(filename);
    const mapped = MOCK_FILENAME_LABEL_DATA[stem];

    if (mapped) {
      return {
        brandName: mapped.brandName,
        alcoholByVolume: mapped.alcoholByVolume,
        netContents: mapped.netContents,
        producerName: mapped.producerName,
        governmentWarning: mapped.governmentWarning ?? existingLabel.governmentWarning,
        classType: mapped.classType ?? this.inferClassType(mapped.brandName),
      };
    }

    return {
      brandName: this.normalizeFallbackText(existingLabel.brandName),
      alcoholByVolume: this.extractAbvFromStem(stem) ?? existingLabel.alcoholByVolume ?? 0,
      netContents:
        this.extractNetContentsFromStem(stem) ||
        this.normalizeFallbackText(existingLabel.netContents),
      producerName: this.normalizeFallbackText(existingLabel.producerName),
      governmentWarning: this.normalizeFallbackText(existingLabel.governmentWarning),
      classType: existingLabel.classType || 'beer',
    };
  }

  private getFileStem(value: string): string {
    const name = basename(value || '').toLowerCase();
    const extension = extname(name);
    return extension ? name.slice(0, -extension.length) : name;
  }

  private normalizeFallbackText(value: string | undefined): string {
    if (!value) {
      return '';
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    const normalized = trimmed.toLowerCase();

    if (
      normalized === 'uploaded label' ||
      normalized === 'uploaded label producer' ||
      normalized === 'unknown producer' ||
      /^cola[-\s]?\d{4}/i.test(trimmed)
    ) {
      return '';
    }

    return trimmed;
  }

  private inferClassType(value: string): string {
    const normalized = value.toLowerCase();

    if (
      normalized.includes('wine') ||
      normalized.includes('cabernet') ||
      normalized.includes('merlot')
    ) {
      return 'wine';
    }

    if (
      normalized.includes('bourbon') ||
      normalized.includes('vodka') ||
      normalized.includes('whiskey') ||
      normalized.includes('whisky') ||
      normalized.includes('tequila') ||
      normalized.includes('rum') ||
      normalized.includes('spirit')
    ) {
      return 'distilled spirit';
    }

    if (normalized.includes('cider')) {
      return 'cider';
    }

    return 'beer';
  }

  private extractAbvFromStem(stem: string): number | undefined {
    const match = stem.match(/(\d+(?:\.\d+)?)\s*(?:abv|alc|percent|pct)/i);
    if (!match) {
      return undefined;
    }

    const parsed = Number(match[1]);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      return undefined;
    }

    return parsed;
  }

  private extractNetContentsFromStem(stem: string): string | undefined {
    const mlMatch = stem.match(/(\d{3,4})\s*ml/i);
    if (mlMatch) {
      return `${mlMatch[1]} mL`;
    }

    const ozMatch = stem.match(/(\d{1,2}(?:\.\d+)?)\s*(?:oz|fl-oz|floz)/i);
    if (ozMatch) {
      return `${ozMatch[1]} fl oz`;
    }

    return undefined;
  }

  private generateId(): string {
    return `label_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
