/**
 * Error and exception types
 */
export declare class AppError extends Error {
    message: string;
    code: string;
    statusCode: number;
    details?: Record<string, unknown> | undefined;
    constructor(message: string, code: string, statusCode?: number, details?: Record<string, unknown> | undefined);
}
export declare class ValidationAppError extends AppError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class NotFoundError extends AppError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string, details?: Record<string, unknown>);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string, details?: Record<string, unknown>);
}
export declare class ConflictError extends AppError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class InternalServerError extends AppError {
    constructor(message?: string, details?: Record<string, unknown>);
}
export interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
        timestamp: string;
    };
}
export interface SuccessResponse<T> {
    success: true;
    data: T;
    meta?: {
        timestamp: string;
        version?: string;
    };
}
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
//# sourceMappingURL=error.types.d.ts.map