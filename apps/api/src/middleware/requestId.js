import { createRequestId } from '@gm-safaris/shared-utils';

/**
 * Attach a correlation ID to every request for logs and error responses.
 * Honors inbound X-Request-Id when present and well-formed.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requestIdMiddleware(req, res, next) {
  const inbound = req.get('x-request-id');
  const requestId =
    inbound && /^[A-Za-z0-9_-]{8,128}$/.test(inbound) ? inbound : createRequestId();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}
