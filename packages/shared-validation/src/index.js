import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  PublishStatus,
} from '@gm-safaris/shared-types';

/**
 * Lightweight shared validators. Framework-agnostic — used by API and later CMS forms.
 * Zod (or similar) may be introduced when domain schemas grow; keep this package lean.
 */

/**
 * @param {unknown} value
 * @returns {{ ok: true, value: string } | { ok: false, message: string }}
 */
export function requireNonEmptyString(value, fieldName = 'value') {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return { ok: false, message: `${fieldName} is required` };
  }
  return { ok: true, value: value.trim() };
}

/**
 * @param {unknown} value
 * @returns {{ ok: true, value: string } | { ok: false, message: string }}
 */
export function validateSlug(value) {
  const base = requireNonEmptyString(value, 'slug');
  if (!base.ok) return base;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(base.value)) {
    return {
      ok: false,
      message: 'slug must be lowercase alphanumeric with hyphens only',
    };
  }
  return base;
}

/**
 * @param {unknown} value
 * @returns {{ ok: true, value: string } | { ok: false, message: string }}
 */
export function validatePublishStatus(value) {
  const allowed = Object.values(PublishStatus);
  if (typeof value !== 'string' || !allowed.includes(value)) {
    return {
      ok: false,
      message: `status must be one of: ${allowed.join(', ')}`,
    };
  }
  return { ok: true, value };
}

/**
 * @param {Record<string, unknown>} [query]
 * @returns {{ page: number, limit: number, offset: number }}
 */
export function parsePagination(query = {}) {
  const pageRaw = Number.parseInt(String(query.page ?? DEFAULT_PAGE), 10);
  const limitRaw = Number.parseInt(String(query.limit ?? DEFAULT_PAGE_LIMIT), 10);

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : DEFAULT_PAGE;
  let limit =
    Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : DEFAULT_PAGE_LIMIT;
  if (limit > MAX_PAGE_LIMIT) limit = MAX_PAGE_LIMIT;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}
