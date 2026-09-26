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
DO $$ BEGIN
  CREATE TYPE content_status AS ENUM (
    'DRAFT',
    'REVIEW',
    'PUBLISHED',
    'UNPUBLISHED',
    'ARCHIVED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
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
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('invited', 'active', 'disabled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
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
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE enquiry_status AS ENUM (
    'New',
    'Open',
    'Replied',
    'Qualified',
    'Booked',
    'Closed',
    'Spam'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
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
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE media_visibility AS ENUM ('public', 'private');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE media_role AS ENUM (
    'hero',
    'gallery',
    'og',
    'inline',
    'poster',
    'video'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE menu_location AS ENUM ('primary', 'utility', 'footer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE accommodation_kind AS ENUM (
    'lodge',
    'tented_camp',
    'camp',
    'hotel',
    'hut',
    'resort',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE vehicle_kind AS ENUM (
    'safari_4x4',
    'land_cruiser',
    'minibus',
    'coach',
    'transfer',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE seo_resource_type AS ENUM (
    'tour',
    'destination',
    'region',
    'blog_post',
    'page',
    'accommodation',
    'climb_route'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

