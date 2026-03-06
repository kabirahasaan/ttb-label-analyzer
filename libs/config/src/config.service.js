"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
exports.getConfig = getConfig;
/**
 * Configuration Service
 * Loads and validates environment variables
 */
class ConfigService {
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
    getConfig() {
        return this.config;
    }
    getAppConfig() {
        return this.config.app;
    }
    getDatabaseUrl() {
        return this.config.database.url;
    }
    getApiPort() {
        return this.config.api.port;
    }
    getApiHost() {
        return this.config.api.host;
    }
    getWebPort() {
        return this.config.web.port;
    }
    getWebApiUrl() {
        return this.config.web.apiUrl;
    }
    isProduction() {
        return this.config.app.environment === 'production';
    }
    isDevelopment() {
        return this.config.app.environment === 'development';
    }
    loadAppConfig() {
        return {
            name: this.getEnv('APP_NAME', 'TTB Label Analyzer'),
            version: this.getEnv('APP_VERSION', '1.0.0'),
            environment: this.getEnv('NODE_ENV', 'development') || 'development',
            debug: this.getEnvBoolean('DEBUG', this.isDev()),
            logLevel: this.getEnv('LOG_LEVEL', 'info') || 'info',
            logFormat: this.getEnv('LOG_FORMAT', 'json') || 'json',
        };
    }
    loadDatabaseConfig() {
        return {
            url: this.getEnv('DATABASE_URL', 'postgresql://user:password@localhost:5432/ttb_label_analyzer'),
            shadowUrl: this.getEnv('DATABASE_SHADOW_URL'),
        };
    }
    loadApiConfig() {
        return {
            port: this.getEnvNumber('API_PORT', 3001),
            host: this.getEnv('API_HOST', '0.0.0.0'),
            nodeEnv: this.getEnv('NODE_ENV', 'development') || 'development',
            corsOrigin: this.getEnv('CORS_ORIGIN', 'http://localhost:3000'),
        };
    }
    loadWebConfig() {
        return {
            port: this.getEnvNumber('WEB_PORT', 3000),
            apiUrl: this.getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001'),
        };
    }
    loadOcrConfig() {
        return {
            engine: this.getEnv('OCR_ENGINE', 'tesseract') || 'tesseract',
            language: this.getEnv('TESSERACT_LANG', 'eng'),
            timeout: this.getEnvNumber('OCR_TIMEOUT', 30000),
        };
    }
    loadUploadConfig() {
        return {
            maxFiles: this.getEnvNumber('UPLOAD_MAX_FILES', 50),
            maxSize: this.getEnvNumber('UPLOAD_MAX_SIZE', 52428800), // 50MB
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
            uploadDir: this.getEnv('UPLOAD_DIR', './uploads'),
        };
    }
    validateConfig() {
        const requiredVars = ['DATABASE_URL'];
        const missing = requiredVars.filter((v) => !process.env[v]);
        if (missing.length > 0) {
            console.warn(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }
    getEnv(key, defaultValue) {
        return process.env[key] || defaultValue || '';
    }
    getEnvNumber(key, defaultValue) {
        const value = process.env[key];
        return value ? parseInt(value, 10) : defaultValue;
    }
    getEnvBoolean(key, defaultValue) {
        const value = process.env[key];
        if (!value)
            return defaultValue;
        return value === 'true' || value === '1' || value === 'yes';
    }
    isDev() {
        return process.env.NODE_ENV !== 'production';
    }
}
exports.ConfigService = ConfigService;
// Singleton instance
let configInstance;
function getConfig() {
    if (!configInstance) {
        configInstance = new ConfigService();
    }
    return configInstance;
}
//# sourceMappingURL=config.service.js.map