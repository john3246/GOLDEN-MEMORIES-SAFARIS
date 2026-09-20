-- Phase 2: shared extensions, enums, and timestamp helper.
-- Apply after 20260911180000_safari_cms.sql. Do not edit applied migrations.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION set_updated_at() IS 'Keeps updated_at current on row changes.';

CREATE TABLE IF NOT EXISTS schema_migrations (
  filename TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Publishing: Safari CMS uses UNPUBLISHED; general content uses REVIEW.
CREATE TYPE content_status AS ENUM (
  'DRAFT',
  'REVIEW',
  'PUBLISHED',
  'UNPUBLISHED',
  'ARCHIVED'
);

CREATE TYPE product_type AS ENUM (
  'private_safari',
  'join_safari',
  'kilimanjaro',
  'meru',
  'day_trip',
  'beach',
  'cultural',
  'custom'
);

CREATE TYPE user_status AS ENUM ('invited', 'active', 'disabled');

CREATE TYPE booking_status AS ENUM (
  'Pending',
  'Confirmed',
  'DepositPaid',
  'Paid',
  'InProgress',
  'Completed',
  'Cancelled',
  'Refunded'
);

CREATE TYPE enquiry_status AS ENUM (
  'New',
  'Open',
  'Replied',
  'Qualified',
  'Booked',
  'Closed',
  'Spam'
);

CREATE TYPE enquiry_source AS ENUM (
  'contact',
  'booking_form',
  'join_safari',
  'kilimanjaro',
  'whatsapp',
  'phone',
  'email',
  'other'
);

CREATE TYPE media_visibility AS ENUM ('public', 'private');

CREATE TYPE media_role AS ENUM (
  'hero',
  'gallery',
  'og',
  'inline',
  'poster',
  'video'
);

CREATE TYPE menu_location AS ENUM ('primary', 'utility', 'footer');

CREATE TYPE accommodation_kind AS ENUM (
  'lodge',
  'tented_camp',
  'camp',
  'hotel',
  'hut',
  'resort',
  'other'
);

CREATE TYPE vehicle_kind AS ENUM (
  'safari_4x4',
  'land_cruiser',
  'minibus',
  'coach',
  'transfer',
  'other'
);

CREATE TYPE seo_resource_type AS ENUM (
  'tour',
  'destination',
  'region',
  'blog_post',
  'page',
  'accommodation',
  'climb_route'
);
