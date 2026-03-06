/**
 * Label-related types and interfaces
 */

export interface LabelData {
  id?: string;
  brandName: string;
  alcoholByVolume: number;
  netContents: string;
  governmentWarning: string;
  classType: string;
  producerName: string;
  imageUrl?: string;
  extractedText?: string;
  rawOcrData?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ParsedLabel extends LabelData {
  confidence?: number;
  ocrEngine?: string;
  processingTimeMs?: number;
}

export interface LabelParseRequest {
  imagePath: string;
  imageBuffer?: Buffer;
  imageUrl?: string;
}

export interface LabelParseResult {
  success: boolean;
  data?: ParsedLabel;
  errors?: string[];
  warnings?: string[];
  metadata?: {
    processingTime: number;
    confidence: number;
  };
}

export type LabelUploadFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';

export interface LabelUploadRequest {
  file: File | Buffer;
  filename: string;
  fileType: LabelUploadFormat;
}

export interface BatchLabelUploadRequest {
  files: LabelUploadRequest[];
  skipOnError?: boolean;
}
