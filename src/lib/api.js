/**
 * API Utilities
 * =============
 * 
 * Shared helper functions for API routes.
 * Includes standardized response formatting and error handling.
 */

/**
 * Creates a standardized JSON success response
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code (default: 200)
 */
export function successResponse(data, status = 200) {
    return Response.json(data, { status });
}

/**
 * Creates a standardized JSON error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 400)
 */
export function errorResponse(message, status = 400) {
    return Response.json({ error: message }, { status });
}

/**
 * Wraps an API handler with error handling
 * @param {Function} handler - Async route handler
 */
export function withErrorHandler(handler) {
    return async (request, context) => {
        try {
            return await handler(request, context);
        } catch (error) {
            console.error('API Error:', error);
            return errorResponse(
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : 'Internal server error',
                500
            );
        }
    };
}
