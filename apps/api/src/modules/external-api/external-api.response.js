/**
 * Consistent API response helpers (DTO envelope — never raw DB rows).
 */

/**
 * @param {import('express').Response} res
 * @param {unknown} data
 * @param {number} [status=200]
 */
export function sendSuccess(res, data, status = 200) {
  return res.status(status).json({
    success: true,
    data,
  });
}

/**
 * @param {import('express').Response} res
 * @param {unknown[]} data
 * @param {{ page: number, limit: number, total: number }} meta
 * @param {number} [status=200]
 */
export function sendCollection(res, data, meta, status = 200) {
  return res.status(status).json({
    success: true,
    data,
    meta,
  });
}
