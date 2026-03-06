import { FullConfig, AppConfig } from './config.interface';
/**
 * Configuration Service
 * Loads and validates environment variables
 */
export declare class ConfigService {
    private config;
    constructor();
    getConfig(): FullConfig;
    getAppConfig(): AppConfig;
    getDatabaseUrl(): string;
    getApiPort(): number;
    getApiHost(): string;
    getWebPort(): number;
    getWebApiUrl(): string;
    isProduction(): boolean;
    isDevelopment(): boolean;
    private loadAppConfig;
    private loadDatabaseConfig;
    private loadApiConfig;
    private loadWebConfig;
    private loadOcrConfig;
    private loadUploadConfig;
    private validateConfig;
    private getEnv;
    private getEnvNumber;
    private getEnvBoolean;
    private isDev;
}
export declare function getConfig(): ConfigService;
//# sourceMappingURL=config.service.d.ts.map