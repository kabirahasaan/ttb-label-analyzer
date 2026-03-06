"use strict";
/**
 * Error and exception types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationAppError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, code, statusCode = 500, details) {
        super(message);
        this.message = message;
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
class ValidationAppError extends AppError {
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', 400, details);
        this.name = 'ValidationAppError';
    }
}
exports.ValidationAppError = ValidationAppError;
class NotFoundError extends AppError {
    constructor(message, details) {
        super(message, 'NOT_FOUND', 404, details);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', details) {
        super(message, 'UNAUTHORIZED', 401, details);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', details) {
        super(message, 'FORBIDDEN', 403, details);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends AppError {
    constructor(message, details) {
        super(message, 'CONFLICT', 409, details);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
class InternalServerError extends AppError {
    constructor(message = 'Internal Server Error', details) {
        super(message, 'INTERNAL_SERVER_ERROR', 500, details);
        this.name = 'InternalServerError';
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=error.types.js.map