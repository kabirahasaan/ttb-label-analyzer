import { TTBRuleDocument } from './ttb-fetcher';

/**
 * Parsed TTB Rule
 */
export interface ParsedTTBRule {
  id: string;
  name: string;
  category: 'required' | 'conditional' | 'prohibited' | 'warning';
  description: string;
  requirements: string[];
  applicableTo: string[]; // beer, wine, spirits, mead, cider
  source: TTBRuleSource;
  cfr?: string; // Code of Federal Regulations reference
  lastUpdated: string;
}

/**
 * TTB Rule Source
 */
export interface TTBRuleSource {
  document: string;
  url: string;
  cfr?: string;
  section?: string;
  quotation?: string;
}

/**
 * TTB Rules Parser
 * Extracts structured rules from TTB documents
 */
export class TTBRulesParser {
  /**
   * Parse fetched documents into structured rules
   */
  parseDocuments(documents: TTBRuleDocument[]): ParsedTTBRule[] {
    const rules: ParsedTTBRule[] = [];

    for (const doc of documents) {
      // Parse based on document type
      if (doc.title.includes('Brand') || doc.title.includes('Name')) {
        rules.push(...this.parseBrandNameRules(doc));
      }
      if (doc.title.includes('ABV') || doc.title.includes('Alcohol')) {
        rules.push(...this.parseABVRules(doc));
      }
      if (doc.title.includes('Warning')) {
        rules.push(...this.parseHealthWarningRules(doc));
      }
      if (doc.title.includes('Net Content')) {
        rules.push(...this.parseNetContentsRules(doc));
      }
      if (doc.title.includes('Origin')) {
        rules.push(...this.parseCountryOfOriginRules(doc));
      }
      if (doc.title.includes('Sulfite')) {
        rules.push(...this.parseSulfiteRules(doc));
      }
      if (doc.title.includes('Prohibited')) {
        rules.push(...this.parseProhibitedStatementsRules(doc));
      }
      if (doc.title.includes('Beer')) {
        rules.push(...this.parseBeerSpecificRules(doc));
      }
      if (doc.title.includes('Wine')) {
        rules.push(...this.parseWineSpecificRules(doc));
      }
      if (doc.title.includes('Spirit')) {
        rules.push(...this.parseSpiritSpecificRules(doc));
      }
    }

    return rules;
  }

  /**
   * Parse brand name rules
   */
  private parseBrandNameRules(doc: TTBRuleDocument): ParsedTTBRule[] {
    return [
      {
        id: 'brand-name-required',
        name: 'Brand Name Required',
        category: 'required',
        description:
          'All alcoholic beverage labels must display a brand name that is easily identifiable',
        requirements: [
          'Brand name must be displayed on the front label',
          'Brand name must be easily readable',
          'Brand name must be in English or English translation provided',
          'Brand name cannot contain misleading statements',
        ],
        applicableTo: ['beer', 'wine', 'spirits', 'mead', 'cider'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 4.28, § 5.37, § 7.51',
        },
        lastUpdated: doc.fetchedAt,
      },
      {
        id: 'brand-name-prominence',
        name: 'Brand Name Prominence',
        category: 'required',
        description: 'Brand name must be displayed prominently on the principal display panel',
        requirements: [
          'Brand name must be the most conspicuous feature',
          'Type size must be proportionate to the label size',
          'Minimum contrast for legibility',
        ],
        applicableTo: ['beer', 'wine', 'spirits', 'mead', 'cider'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 4.30, § 5.40, § 7.54',
        },
        lastUpdated: doc.fetchedAt,
      },
      {
        id: 'brand-name-language',
        name: 'Brand Name Language',
        category: 'required',
        description:
          'Brand names in foreign languages must be immediately followed by English translation',
        requirements: [
          'Foreign language names must have English equivalent',
          'Translation must be on same display panel',
          'Translation must be clearly associated with foreign name',
        ],
        applicableTo: ['beer', 'wine', 'spirits', 'mead', 'cider'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 4.29',
        },
        lastUpdated: doc.fetchedAt,
      },
    ];
  }

  /**
   * Parse ABV rules
   */
  private parseABVRules(doc: TTBRuleDocument): ParsedTTBRule[] {
    return [
      {
        id: 'abv-statement-required',
        name: 'Alcohol by Volume Statement Required',
        category: 'required',
        description:
          'The percentage of alcohol by volume (ABV) must appear on all alcoholic beverage labels',
        requirements: [
          'ABV must be expressed as percentage by volume',
          'ABV statement must appear on front label or back label',
          'Maximum variance allowed: 0.5% of stated ABV',
          'For beers: ABV optional if not tested',
        ],
        applicableTo: ['beer', 'wine', 'spirits', 'mead', 'cider'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 4.38 (wine), § 5.48 (spirits), § 7.65 (beer)',
        },
        lastUpdated: doc.fetchedAt,
      },
      {
        id: 'abv-tolerance',
        name: 'ABV Tolerance Limits',
        category: 'required',
        description: 'Actual ABV must fall within acceptable tolerance of declared ABV',
        requirements: [
          'Maximum variance: +0.5% or -0.5% from declared value',
          'Variance applies to finished product testing',
          'Class B & C wines: ±1% tolerance allowed',
        ],
        applicableTo: ['beer', 'wine', 'spirits', 'mead', 'cider'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 4.38, § 5.48',
        },
        lastUpdated: doc.fetchedAt,
      },
      {
        id: 'abv-format',
        name: 'ABV Format Requirements',
        category: 'required',
        description: 'ABV must be displayed in specific format on the label',
        requirements: [
          'Use format: "Alcohol X.X% by Volume" or "X.X% alc./vol."',
          'Can use "alc. vol." abbreviation',
          'ABV in numerals, not spelled out',
          'Must be clearly separated from nutritional or other statements',
        ],
        applicableTo: ['beer', 'wine', 'spirits', 'mead', 'cider'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 4.38(a)',
        },
        lastUpdated: doc.fetchedAt,
      },
    ];
  }

  /**
   * Parse health warning rules
   */
  private parseHealthWarningRules(doc: TTBRuleDocument): ParsedTTBRule[] {
    return [
      {
        id: 'health-warning-required',
        name: 'Health Warning Statement Required',
        category: 'required',
        description: 'All alcohol beverage labels must contain government-mandated health warning',
        requirements: [
          'Must include warning about health risks and pregnancy',
          'Must include warning about operating machinery',
          'Must use exact government text or approved variations',
          'Must appear on principal display or information panel',
        ],
        applicableTo: ['beer', 'wine', 'spirits', 'mead', 'cider'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 4.32, § 5.32, § 7.45',
        },
        lastUpdated: doc.fetchedAt,
      },
      {
        id: 'health-warning-text',
        name: 'Health Warning Text Requirements',
        category: 'required',
        description: 'Specific text is required for government health warning',
        requirements: [
          'Must state pregnancy warning',
          'Must state health hazard warning',
          'Must state impairment warning',
          'Text must be in black on white background for minimum contrast',
        ],
        applicableTo: ['beer', 'wine', 'spirits', 'mead', 'cider'],
        source: {
          document: doc.title,
          url: doc.url,
          quotation:
            '"GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems."',
        },
        lastUpdated: doc.fetchedAt,
      },
      {
        id: 'health-warning-size',
        name: 'Health Warning Size and Prominence',
        category: 'required',
        description: 'Health warning must meet minimum size requirements',
        requirements: [
          'Minimum 2-point type (for labels smaller than 5 square inches)',
          'Minimum 3-point type (for labels 5 to 40 square inches)',
          'Proportional to label size',
          'Must be easily readable and conspicuous',
        ],
        applicableTo: ['beer', 'wine', 'spirits', 'mead', 'cider'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 4.33',
        },
        lastUpdated: doc.fetchedAt,
      },
    ];
  }

  /**
   * Parse net contents rules
   */
  private parseNetContentsRules(doc: TTBRuleDocument): ParsedTTBRule[] {
    return [
      {
        id: 'net-contents-required',
        name: 'Net Contents Required',
        category: 'required',
        description: 'Net contents of the beverage must be clearly stated on the label',
        requirements: [
          'Must state quantity in both metric and US customary units',
          'Metric on left, US customary on right (or above/below)',
          'Must appear on principal display panel',
          'Use standard abbreviations (mL, L, fl oz)',
        ],
        applicableTo: ['beer', 'wine', 'spirits', 'mead', 'cider'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 4.36, § 5.46, § 7.63',
        },
        lastUpdated: doc.fetchedAt,
      },
      {
        id: 'net-contents-format',
        name: 'Net Contents Format',
        category: 'required',
        description: 'Net contents must be displayed in specific format',
        requirements: [
          'Use bold type, easily readable',
          'Must match actual contents within tolerance',
          'Standard tolerances: 0.5 fl oz for beverages',
          'Not to be included in type measure of brand name',
        ],
        applicableTo: ['beer', 'wine', 'spirits', 'mead', 'cider'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 4.36',
        },
        lastUpdated: doc.fetchedAt,
      },
    ];
  }

  /**
   * Parse country of origin rules
   */
  private parseCountryOfOriginRules(doc: TTBRuleDocument): ParsedTTBRule[] {
    return [
      {
        id: 'country-origin-required',
        name: 'Country of Origin Required for Imports',
        category: 'conditional',
        description: 'Imported beverages must display country of origin on label',
        requirements: [
          'Must include country of origin if product is imported',
          'For US produced: "Product of the United States" or similar',
          'For imports: Name of country of origin',
          'Domestic content must be labeled accordingly',
        ],
        applicableTo: ['beer', 'wine', 'spirits', 'mead', 'cider'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 4.34, § 5.44, § 7.61',
        },
        lastUpdated: doc.fetchedAt,
      },
    ];
  }

  /**
   * Parse sulfite rules
   */
  private parseSulfiteRules(doc: TTBRuleDocument): ParsedTTBRule[] {
    return [
      {
        id: 'sulfite-disclosure-required',
        name: 'Sulfite Disclosure Required',
        category: 'conditional',
        description: 'Wine and some beverages containing sulfites must declare this on label',
        requirements: [
          'Required if sulfites exceed 10 ppm in wine',
          'Statement: "Contains Sulfites" must appear on label',
          'Required for most wines (natural fermentation produces sulfites)',
          'Location: any label panel',
        ],
        applicableTo: ['wine'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 4.26',
        },
        lastUpdated: doc.fetchedAt,
      },
    ];
  }

  /**
   * Parse prohibited statements rules
   */
  private parseProhibitedStatementsRules(doc: TTBRuleDocument): ParsedTTBRule[] {
    return [
      {
        id: 'no-health-claims',
        name: 'Health Claims Prohibited',
        category: 'prohibited',
        description: 'Labels cannot make unsupported health or nutritional claims',
        requirements: [
          'Cannot claim product prevents disease',
          'Cannot claim therapeutic benefits',
          'Cannot use terms like "cure", "treat", "heal"',
          'Limited statements allowed with federal approval',
        ],
        applicableTo: ['beer', 'wine', 'spirits', 'mead', 'cider'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 4.21',
        },
        lastUpdated: doc.fetchedAt,
      },
      {
        id: 'no-misleading-statements',
        name: 'Misleading Statements Prohibited',
        category: 'prohibited',
        description: 'Labels cannot contain statements that mislead consumers',
        requirements: [
          'Cannot use false advertising',
          'Cannot misrepresent origin or composition',
          'Cannot use misleading terminology',
          'Cannot suggest different type than actual',
        ],
        applicableTo: ['beer', 'wine', 'spirits', 'mead', 'cider'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 4.5',
        },
        lastUpdated: doc.fetchedAt,
      },
    ];
  }

  /**
   * Parse beer-specific rules
   */
  private parseBeerSpecificRules(doc: TTBRuleDocument): ParsedTTBRule[] {
    return [
      {
        id: 'beer-class-type',
        name: 'Beer Class and Type',
        category: 'required',
        description: 'Beer must be classified by type on the label',
        requirements: [
          'Must designate class: Beer, Ale, Porter, Stout, Lager, etc.',
          'Can use accepted beer style designations',
          'Type must be accurate representation of product',
        ],
        applicableTo: ['beer'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 7.22',
        },
        lastUpdated: doc.fetchedAt,
      },
    ];
  }

  /**
   * Parse wine-specific rules
   */
  private parseWineSpecificRules(doc: TTBRuleDocument): ParsedTTBRule[] {
    return [
      {
        id: 'wine-class-type',
        name: 'Wine Class and Type',
        category: 'required',
        description: 'Wine must be classified appropriately on the label',
        requirements: [
          'Must designate wine type: still wine, sparkling wine, dessert wine, etc.',
          'Class designation required (wine, aperitif wine, distilled spirits, etc.)',
          'For wines 14% ABV or higher: must state class type',
        ],
        applicableTo: ['wine'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 4.22',
        },
        lastUpdated: doc.fetchedAt,
      },
      {
        id: 'wine-vintage-year',
        name: 'Wine Vintage Year Requirements',
        category: 'conditional',
        description: 'If vintage year is shown, 95% of wine must be from that vintage',
        requirements: [
          'If vintage year stated: at least 95% must be from that year',
          'Vintage may be optional for non-vintage wines',
          'Year must be clearly identified',
        ],
        applicableTo: ['wine'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 4.24',
        },
        lastUpdated: doc.fetchedAt,
      },
    ];
  }

  /**
   * Parse distilled spirits-specific rules
   */
  private parseSpiritSpecificRules(doc: TTBRuleDocument): ParsedTTBRule[] {
    return [
      {
        id: 'spirits-class-type',
        name: 'Spirits Class and Type',
        category: 'required',
        description: 'Distilled spirits must be classified by type',
        requirements: [
          'Must designate class: whiskey, brandy, rum, gin, vodka, etc.',
          'Type must conform to COLA standards',
          'Subclass information may be required for certain spirits',
        ],
        applicableTo: ['spirits'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 5.22',
        },
        lastUpdated: doc.fetchedAt,
      },
      {
        id: 'spirits-proof',
        name: 'Spirits Proof Declaration',
        category: 'required',
        description: 'Distilled spirits must show proof on label',
        requirements: [
          'Must state proof (always double the ABV)',
          'Example: 80 proof = 40% ABV',
          'Proof declaration on principal display panel',
        ],
        applicableTo: ['spirits'],
        source: {
          document: doc.title,
          url: doc.url,
          cfr: '27 CFR § 5.48',
        },
        lastUpdated: doc.fetchedAt,
      },
    ];
  }
}
