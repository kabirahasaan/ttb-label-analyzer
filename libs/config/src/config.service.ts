import {
  FullConfig,
  AppConfig,
  DatabaseConfig,
  ApiConfig,
  OcrConfig,
  UploadConfig,
} from './config.interface';

/**
 * Configuration Service
 * Loads and validates environment variables
 */
export class ConfigService {
  private config: FullConfig;

  constructor() {
    this.config = {
      app: this.loadAppConfig(),
      database: this.loadDatabaseConfig(),
      api: this.loadApiConfig(),
      web: this.loadWebConfig(),
      ocr: this.loadOcrConfig(),
      upload: this.loadUploadConfig(),
    };

    this.validateConfig();
  }

  getConfig(): FullConfig {
    return this.config;
  }

  getAppConfig(): AppConfig {
    return this.config.app;
  }

  getDatabaseUrl(): string {
    return this.config.database.url;
  }

  getApiPort(): number {
    return this.config.api.port;
  }

  getApiHost(): string {
    return this.config.api.host;
  }

  getWebPort(): number {
    return this.config.web.port;
  }

  getWebApiUrl(): string {
    return this.config.web.apiUrl;
  }

  isProduction(): boolean {
    return this.config.app.environment === 'production';
  }

  isDevelopment(): boolean {
    return this.config.app.environment === 'development';
  }

  private loadAppConfig(): AppConfig {
    return {
      name: this.getEnv('APP_NAME', 'TTB Label Analyzer'),
      version: this.getEnv('APP_VERSION', '1.0.0'),
      environment: (this.getEnv('NODE_ENV', 'development') as any) || 'development',
      debug: this.getEnvBoolean('DEBUG', this.isDev()),
      logLevel: (this.getEnv('LOG_LEVEL', 'info') as any) || 'info',
      logFormat: (this.getEnv('LOG_FORMAT', 'json') as any) || 'json',
    };
  }

  private loadDatabaseConfig(): DatabaseConfig {
    return {
      url: this.getEnv(
        'DATABASE_URL',
        'postgresql://user:password@localhost:5432/ttb_label_analyzer'
      ),
      shadowUrl: this.getEnv('DATABASE_SHADOW_URL'),
    };
  }

  private loadApiConfig(): ApiConfig {
    return {
      port: this.getEnvNumber('API_PORT', 3001),
      host: this.getEnv('API_HOST', '0.0.0.0'),
      nodeEnv: (this.getEnv('NODE_ENV', 'development') as any) || 'development',
      corsOrigin: this.getEnv('CORS_ORIGIN', 'http://localhost:3000'),
    };
  }

  private loadWebConfig() {
    return {
      port: this.getEnvNumber('WEB_PORT', 3000),
      apiUrl: this.getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001'),
    };
  }

  private loadOcrConfig(): OcrConfig {
    return {
      engine: (this.getEnv('OCR_ENGINE', 'tesseract') as any) || 'tesseract',
      language: this.getEnv('TESSERACT_LANG', 'eng'),
      timeout: this.getEnvNumber('OCR_TIMEOUT', 30000),
    };
  }

  private loadUploadConfig(): UploadConfig {
    return {
      maxFiles: this.getEnvNumber('UPLOAD_MAX_FILES', 50),
      maxSize: this.getEnvNumber('UPLOAD_MAX_SIZE', 52428800), // 50MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      uploadDir: this.getEnv('UPLOAD_DIR', './uploads'),
    };
  }

  private validateConfig(): void {
    const requiredVars = ['DATABASE_URL'];

    const missing = requiredVars.filter((v) => !process.env[v]);
    if (missing.length > 0) {
      console.warn(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  private getEnv(key: string, defaultValue?: string): string {
    return process.env[key] || defaultValue || '';
  }

  private getEnvNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    return value ? parseInt(value, 10) : defaultValue;
  }

  private getEnvBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value === 'true' || value === '1' || value === 'yes';
  }

  private isDev(): boolean {
    return process.env.NODE_ENV !== 'production';
  }
}

// Singleton instance
let configInstance: ConfigService;

export function getConfig(): ConfigService {
  if (!configInstance) {
    configInstance = new ConfigService();
  }
  return configInstance;
}
