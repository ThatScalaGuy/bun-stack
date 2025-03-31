/**
 * Custom errors for the application
 * Extends the base Error class with specific error types and status codes
 */

/**
 * Base API Error class
 * Extends Error with additional properties for API responses
 */
export class ApiError extends Error {
    status: number;
    code: string;

    constructor(message: string, status: number = 500, code: string = 'SERVER_ERROR') {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.code = code;

        // Ensures proper stack trace for debugging
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Unauthorized error
 * Used when authentication is required but not provided or invalid
 */
export class UnauthorizedError extends ApiError {
    constructor(message: string = 'Authentication required') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

/**
 * Forbidden error
 * Used when the user is authenticated but doesn't have permission
 */
export class ForbiddenError extends ApiError {
    constructor(message: string = 'Insufficient permissions') {
        super(message, 403, 'FORBIDDEN');
    }
}

/**
 * Not found error
 * Used when a resource doesn't exist
 */
export class NotFoundError extends ApiError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

/**
 * Bad request error
 * Used for validation errors or invalid input
 */
export class BadRequestError extends ApiError {
    constructor(message: string = 'Invalid request') {
        super(message, 400, 'BAD_REQUEST');
    }
}

/**
 * Conflict error
 * Used when there's a conflict with the current state of the resource
 */
export class ConflictError extends ApiError {
    constructor(message: string = 'Resource conflict') {
        super(message, 409, 'CONFLICT');
    }
}

/**
 * Too many requests error
 * Used for rate limiting
 */
export class TooManyRequestsError extends ApiError {
    constructor(message: string = 'Rate limit exceeded') {
        super(message, 429, 'TOO_MANY_REQUESTS');
    }
}
