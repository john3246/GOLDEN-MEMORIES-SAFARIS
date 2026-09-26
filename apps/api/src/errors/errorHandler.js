import { AppError, ErrorCodes } from './AppError.js';
import { logger } from '../logging/index.js';
import { config } from '../config/index.js';

/**
 * Express 4-arg error middleware. Never expose stack traces or SQL in production.
 *
 * @param {unknown} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export function errorHandler(err, req, res, _next) {
  const requestId = req.requestId;

  if (err && err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: err.code === 'LIMIT_FILE_SIZE' ? 'Image is too large' : 'Invalid upload',
        ...(requestId ? { requestId } : {}),
      },
    });
  }

  if (err && (err.type === 'entity.parse.failed' || err.type === 'entity.too.large')) {
    return res.status(err.type === 'entity.too.large' ? 413 : 400).json({
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: err.type === 'entity.too.large' ? 'The request is too large' : 'The request body is not valid JSON',
        ...(requestId ? { requestId } : {}),
      },
    });
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, {
        requestId,
        code: err.code,
        path: req.path,
      });
    }

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
        ...(requestId ? { requestId } : {}),
      },
    });
  }

  logger.error('Unhandled error', {
    requestId,
    path: req.path,
    name: err instanceof Error ? err.name : 'Unknown',
    message: err instanceof Error ? err.message : String(err),
    ...(config.isDevelopment && err instanceof Error ? { stack: err.stack } : {}),
  });

  return res.status(500).json({
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: config.isDevelopment && err instanceof Error
        ? err.message
        : 'An unexpected error occurred',
      ...(requestId ? { requestId } : {}),
    },
  });
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: ErrorCodes.RESOURCE_NOT_FOUND,
      message: `Route not found: ${req.method} ${req.path}`,
      ...(req.requestId ? { requestId: req.requestId } : {}),
    },
  });
}
