/**
 * Shared domain constants and type-like enumerations.
 * Keep in sync with PostgreSQL enums / check constraints (database/migrations).
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

/**
 * PostgreSQL content_status enum (tours, destinations, pages, blog, lodges).
 * @typedef {'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED'} ContentStatus
 */
export const ContentStatus = Object.freeze({
  DRAFT: 'DRAFT',
  REVIEW: 'REVIEW',
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
  ARCHIVED: 'ARCHIVED',
});

/** Statuses safe to expose via the external read-only API */
export const PUBLIC_PUBLISH_STATUSES = Object.freeze([PublishStatus.PUBLISHED]);

export const PUBLIC_SAFARI_STATUSES = Object.freeze([SafariStatus.PUBLISHED]);

export const PUBLIC_CONTENT_STATUSES = Object.freeze([ContentStatus.PUBLISHED]);

/** @typedef {'Super Admin' | 'Admin' | 'Editor' | 'Manager' | 'Viewer'} CmsRoleName */

export const CmsRole = Object.freeze({
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  MANAGER: 'Manager',
  VIEWER: 'Viewer',
});

export const CmsRoleSlug = Object.freeze({
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  MANAGER: 'manager',
  VIEWER: 'viewer',
});

/**
 * @typedef {'private_safari' | 'join_safari' | 'kilimanjaro' | 'meru' | 'day_trip' | 'beach' | 'cultural' | 'custom'} ProductType
 */
export const ProductType = Object.freeze({
  PRIVATE_SAFARI: 'private_safari',
  JOIN_SAFARI: 'join_safari',
  KILIMANJARO: 'kilimanjaro',
  MERU: 'meru',
  DAY_TRIP: 'day_trip',
  BEACH: 'beach',
  CULTURAL: 'cultural',
  CUSTOM: 'custom',
});

export const BookingStatus = Object.freeze({
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  DEPOSIT_PAID: 'DepositPaid',
  PAID: 'Paid',
  IN_PROGRESS: 'InProgress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
});

export const EnquiryStatus = Object.freeze({
  NEW: 'New',
  OPEN: 'Open',
  REPLIED: 'Replied',
  QUALIFIED: 'Qualified',
  BOOKED: 'Booked',
  CLOSED: 'Closed',
  SPAM: 'Spam',
});

export const EnquirySource = Object.freeze({
  CONTACT: 'contact',
  BOOKING_FORM: 'booking_form',
  JOIN_SAFARI: 'join_safari',
  KILIMANJARO: 'kilimanjaro',
  WHATSAPP: 'whatsapp',
  PHONE: 'phone',
  EMAIL: 'email',
  OTHER: 'other',
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

/** PostgreSQL permissions.key values */
export const Permission = Object.freeze({
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  ROLES_MANAGE: 'roles:manage',
  SAFARIS_READ: 'safaris:read',
  SAFARIS_WRITE: 'safaris:write',
  SAFARIS_PUBLISH: 'safaris:publish',
  SAFARIS_DELETE: 'safaris:delete',
  DESTINATIONS_READ: 'destinations:read',
  DESTINATIONS_WRITE: 'destinations:write',
  DESTINATIONS_PUBLISH: 'destinations:publish',
  BLOG_READ: 'blog:read',
  BLOG_WRITE: 'blog:write',
  BLOG_PUBLISH: 'blog:publish',
  PAGES_READ: 'pages:read',
  PAGES_WRITE: 'pages:write',
  PAGES_PUBLISH: 'pages:publish',
  MEDIA_MANAGE: 'media:manage',
  ACCOMMODATIONS_READ: 'accommodations:read',
  ACCOMMODATIONS_WRITE: 'accommodations:write',
  BOOKINGS_READ: 'bookings:read',
  BOOKINGS_WRITE: 'bookings:write',
  BOOKINGS_MANAGE: 'bookings:manage',
  ENQUIRIES_READ: 'enquiries:read',
  ENQUIRIES_WRITE: 'enquiries:write',
  CUSTOMERS_READ: 'customers:read',
  CUSTOMERS_WRITE: 'customers:write',
  REVIEWS_READ: 'reviews:read',
  REVIEWS_WRITE: 'reviews:write',
  FAQS_READ: 'faqs:read',
  FAQS_WRITE: 'faqs:write',
  DEPARTURES_READ: 'departures:read',
  DEPARTURES_WRITE: 'departures:write',
  VEHICLES_READ: 'vehicles:read',
  VEHICLES_WRITE: 'vehicles:write',
  SETTINGS_MANAGE: 'settings:manage',
  API_CLIENTS_MANAGE: 'api_clients:manage',
  AUDIT_READ: 'audit:read',
});

const ALL_PERMISSIONS = Object.freeze(Object.values(Permission));

export const CmsRoleScopes = Object.freeze({
  'Super Admin': ALL_PERMISSIONS,
  Admin: Object.freeze(ALL_PERMISSIONS.filter((key) => key !== Permission.ROLES_MANAGE)),
  Manager: Object.freeze([
    Permission.SAFARIS_READ,
    Permission.DESTINATIONS_READ,
    Permission.BLOG_READ,
    Permission.PAGES_READ,
    Permission.ACCOMMODATIONS_READ,
    Permission.REVIEWS_READ,
    Permission.FAQS_READ,
    Permission.BOOKINGS_READ,
    Permission.BOOKINGS_WRITE,
    Permission.BOOKINGS_MANAGE,
    Permission.ENQUIRIES_READ,
    Permission.ENQUIRIES_WRITE,
    Permission.CUSTOMERS_READ,
    Permission.CUSTOMERS_WRITE,
    Permission.DEPARTURES_READ,
    Permission.DEPARTURES_WRITE,
    Permission.VEHICLES_READ,
    Permission.VEHICLES_WRITE,
    Permission.MEDIA_MANAGE,
    Permission.AUDIT_READ,
  ]),
  Editor: Object.freeze([
    Permission.SAFARIS_READ,
    Permission.SAFARIS_WRITE,
    Permission.SAFARIS_PUBLISH,
    Permission.DESTINATIONS_READ,
    Permission.DESTINATIONS_WRITE,
    Permission.DESTINATIONS_PUBLISH,
    Permission.BLOG_READ,
    Permission.BLOG_WRITE,
    Permission.BLOG_PUBLISH,
    Permission.PAGES_READ,
    Permission.PAGES_WRITE,
    Permission.PAGES_PUBLISH,
    Permission.MEDIA_MANAGE,
    Permission.ACCOMMODATIONS_READ,
    Permission.ACCOMMODATIONS_WRITE,
    Permission.REVIEWS_READ,
    Permission.REVIEWS_WRITE,
    Permission.FAQS_READ,
    Permission.FAQS_WRITE,
    Permission.DEPARTURES_READ,
    Permission.DEPARTURES_WRITE,
  ]),
  Viewer: Object.freeze([
    Permission.SAFARIS_READ,
    Permission.DESTINATIONS_READ,
    Permission.BLOG_READ,
    Permission.PAGES_READ,
    Permission.ACCOMMODATIONS_READ,
    Permission.REVIEWS_READ,
    Permission.FAQS_READ,
    Permission.BOOKINGS_READ,
    Permission.ENQUIRIES_READ,
    Permission.CUSTOMERS_READ,
    Permission.DEPARTURES_READ,
    Permission.VEHICLES_READ,
    Permission.AUDIT_READ,
  ]),
});

export const SAFARI_SECTION_TYPES = Object.freeze([
  'hero',
  'overview',
  'highlights',
  'gallery',
  'facts',
  'itinerary',
  'accommodation',
  'lodges',
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

export const BLOG_SECTION_TYPES = Object.freeze([
  'hero',
  'intro',
  'body',
  'gallery',
  'related',
  'booking_cta',
]);

export const DEFAULT_BLOG_SECTIONS = Object.freeze(
  BLOG_SECTION_TYPES.map((type, order) => Object.freeze({ type, enabled: true, order }))
);

export const BLOG_BLOCK_TYPES = Object.freeze([
  'heading',
  'paragraph',
  'list',
  'quote',
  'image',
  'gallery',
  'cta',
  'callout',
  'map',
  'tours',
  'lodges',
]);

export const BLOG_CALLOUT_TYPES = Object.freeze(['info', 'tip', 'warning']);
export const BLOG_IMAGE_LAYOUTS = Object.freeze(['full', 'center', 'float-left', 'float-right']);
export const BLOG_GALLERY_MODES = Object.freeze(['grid', 'carousel', 'lightbox']);
export const BLOG_CTA_VARIANTS = Object.freeze(['gold', 'navy', 'light']);
export const BLOG_TOPIC_SLUGS = Object.freeze([
  'climbing',
  'safari',
  'about-us',
  'about-tanzania',
  'islands',
  'wildlife',
  'itineraries',
]);

export const DESTINATION_BLOCK_TYPES = Object.freeze(['heading', 'paragraph', 'image', 'table']);

export const LODGE_CATEGORIES = Object.freeze({
  MIDRANGE: 'midrange',
  LUXURY: 'luxury',
  PREMIUM_LUXURY: 'premium-luxury',
});

export const LODGE_CATEGORY_LABELS = Object.freeze({
  midrange: 'Mid-range',
  luxury: 'Luxury',
  'premium-luxury': 'Premium Luxury',
});

export function normalizeLodgeCategory(value) {
  const raw = String(value || '')
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .trim();
  if (raw === 'premium-luxury' || raw === 'premium' || raw === 'premiumluxury') return 'premium-luxury';
  if (raw === 'luxury') return 'luxury';
  return 'midrange';
}

export function lodgeCategoryLabel(value) {
  return LODGE_CATEGORY_LABELS[normalizeLodgeCategory(value)];
}

export const ApiVersion = Object.freeze({
  V1: 'v1',
});

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 250;
