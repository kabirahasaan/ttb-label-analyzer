/**
 * API-related types and interfaces
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    offset?: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}
export interface SortParams {
    sortBy?: string;
    order?: 'asc' | 'desc';
}
export interface FilterParams {
    [key: string]: unknown;
}
export interface QueryParams extends PaginationParams, SortParams, FilterParams {
}
export interface FileUploadResponse {
    id: string;
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    uploadedAt: Date;
    url?: string;
}
export interface BatchUploadResponse {
    batchId: string;
    uploadedCount: number;
    failedCount: number;
    results: Array<{
        filename: string;
        success: boolean;
        id?: string;
        error?: string;
    }>;
}
export interface HealthCheckResponse {
    status: 'ok' | 'error';
    timestamp: string;
    version: string;
    uptime: number;
    database?: {
        status: 'connected' | 'disconnected' | 'error';
    };
}
//# sourceMappingURL=api.types.d.ts.map