/**
 * Shared domain constants and type-like enumerations.
 * Keep in sync with PostgreSQL enums / check constraints (Phase 2).
 */

/** @typedef {'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED'} PublishStatus */

export const PublishStatus = Object.freeze({
  DRAFT: 'DRAFT',
  REVIEW: 'REVIEW',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
});

/**
 * Safari CMS workflow statuses (spec).
 * UNPUBLISHED keeps a published snapshot off the public API until republish.
 * @typedef {'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED'} SafariStatus
 */
export const SafariStatus = Object.freeze({
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
  ARCHIVED: 'ARCHIVED',
});

/** Statuses safe to expose via the external read-only API */
export const PUBLIC_PUBLISH_STATUSES = Object.freeze([PublishStatus.PUBLISHED]);

export const PUBLIC_SAFARI_STATUSES = Object.freeze([SafariStatus.PUBLISHED]);

/** @typedef {'Admin' | 'Editor' | 'Manager' | 'Viewer'} CmsRoleName */

export const CmsRole = Object.freeze({
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  MANAGER: 'Manager',
  VIEWER: 'Viewer',
});

/**
 * External consumer permission strings (read-only).
 * Write / publish / admin permissions must never be granted to external API keys.
 */
export const ExternalPermission = Object.freeze({
  TOURS_READ: 'content:tours:read',
  DESTINATIONS_READ: 'content:destinations:read',
  PAGES_READ: 'content:pages:read',
  BLOG_READ: 'content:blog:read',
  TESTIMONIALS_READ: 'content:testimonials:read',
  NAVIGATION_READ: 'content:navigation:read',
  SITE_SETTINGS_READ: 'content:site-settings:read',
  SAFARIS_READ: 'safaris:read',
});

/** CMS / API-client scopes for the Safari module */
export const SafariScope = Object.freeze({
  READ: 'safaris:read',
  WRITE: 'safaris:write',
  PUBLISH: 'safaris:publish',
  DELETE: 'safaris:delete',
  MEDIA: 'media:manage',
  API_CLIENTS: 'api_clients:manage',
});

export const CmsRoleScopes = Object.freeze({
  Admin: Object.freeze([
    SafariScope.READ,
    SafariScope.WRITE,
    SafariScope.PUBLISH,
    SafariScope.DELETE,
    SafariScope.MEDIA,
    SafariScope.API_CLIENTS,
  ]),
  Editor: Object.freeze([
    SafariScope.READ,
    SafariScope.WRITE,
    SafariScope.PUBLISH,
    SafariScope.MEDIA,
  ]),
  Manager: Object.freeze([
    SafariScope.READ,
    SafariScope.WRITE,
    SafariScope.PUBLISH,
    SafariScope.MEDIA,
  ]),
  Viewer: Object.freeze([SafariScope.READ]),
});

export const SAFARI_SECTION_TYPES = Object.freeze([
  'hero',
  'overview',
  'highlights',
  'gallery',
  'facts',
  'itinerary',
  'accommodation',
  'included',
  'excluded',
  'destination',
  'map',
  'faq',
  'related',
  'booking_cta',
]);

export const DEFAULT_SAFARI_SECTIONS = Object.freeze(
  SAFARI_SECTION_TYPES.map((type, order) =>
    Object.freeze({ type, enabled: true, order })
  )
);

export const ApiVersion = Object.freeze({
  V1: 'v1',
});

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 250;
