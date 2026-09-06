/**
 * Application error types with stable machine-readable codes.
 * Controllers/services throw AppError; the central handler maps to HTTP responses.
 */

export class AppError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {number} [statusCode=500]
   * @param {Record<string, unknown>} [details]
   */
  constructor(code, message, statusCode = 500, details) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

export const ErrorCodes = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
});

export function notFound(message = 'Resource not found') {
  return new AppError(ErrorCodes.RESOURCE_NOT_FOUND, message, 404);
}

export function unauthorized(message = 'Authentication required') {
  return new AppError(ErrorCodes.UNAUTHORIZED, message, 401);
}

export function forbidden(message = 'Insufficient permissions') {
  return new AppError(ErrorCodes.FORBIDDEN, message, 403);
}

export function validationError(message, details) {
  return new AppError(ErrorCodes.VALIDATION_ERROR, message, 400, details);
}

export function notImplemented(message = 'Not implemented yet') {
  return new AppError(ErrorCodes.NOT_IMPLEMENTED, message, 501);
}
