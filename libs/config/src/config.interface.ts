/**
 * Configuration interfaces
 */

export interface DatabaseConfig {
  url: string;
  shadowUrl?: string;
}

export interface ApiConfig {
  port: number;
  host: string;
  nodeEnv: 'development' | 'production' | 'test';
  corsOrigin: string;
}

export interface WebConfig {
  port: number;
  apiUrl: string;
}

export interface OcrConfig {
  engine: 'tesseract' | 'aws-textract';
  language: string;
  timeout: number;
}

export interface UploadConfig {
  maxFiles: number;
  maxSize: number;
  allowedMimeTypes: string[];
  uploadDir: string;
}

export interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'production' | 'test';
  debug: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logFormat: 'json' | 'text';
}

export interface FullConfig {
  app: AppConfig;
  database: DatabaseConfig;
  api: ApiConfig;
  web: WebConfig;
  ocr: OcrConfig;
  upload: UploadConfig;
}
