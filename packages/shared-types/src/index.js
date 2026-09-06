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

/** Statuses safe to expose via the external read-only API */
export const PUBLIC_PUBLISH_STATUSES = Object.freeze([PublishStatus.PUBLISHED]);

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
});

export const ApiVersion = Object.freeze({
  V1: 'v1',
});

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;
