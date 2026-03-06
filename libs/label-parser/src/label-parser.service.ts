import { Injectable } from '@nestjs/common';
import { LabelParser } from './label.parser';
import { LabelParseRequest, LabelParseResult } from '@ttb/shared-types';

/**
 * Label Parser Service for NestJS
 */
@Injectable()
export class LabelParserService {
  private parser: LabelParser;

  constructor() {
    this.parser = new LabelParser({
      timeout: process.env.OCR_TIMEOUT ? parseInt(process.env.OCR_TIMEOUT) : 30000,
      language: process.env.TESSERACT_LANG || 'eng',
    });
  }

  async parse(request: LabelParseRequest): Promise<LabelParseResult> {
    return this.parser.parseLabel(request);
  }
}
