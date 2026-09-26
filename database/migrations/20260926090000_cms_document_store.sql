-- CMS moves onto PostgreSQL.
--
-- Every CMS collection (tours, destinations, blog, lodges, pages, FAQs, menus,
-- group safaris, bookings, inquiries, customers, reviews, webhooks, audit log …)
-- is stored as one JSONB document per row. The API keeps an in-memory copy for
-- fast reads and writes only the rows that changed, inside a transaction.
--
-- Staff users live in the relational `users` / `user_roles` tables (see below),
-- and uploaded photos are stored in `cms_media_blobs` so they survive redeploys
-- on hosts with an ephemeral disk (Render, Railway, Heroku …).

CREATE TABLE IF NOT EXISTS cms_documents (
  collection TEXT NOT NULL,
  id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (collection, id)
);

CREATE INDEX IF NOT EXISTS cms_documents_collection_idx ON cms_documents (collection);
CREATE INDEX IF NOT EXISTS cms_documents_slug_idx ON cms_documents (collection, (data->>'slug'));
CREATE INDEX IF NOT EXISTS cms_documents_status_idx ON cms_documents (collection, (data->>'status'));

COMMENT ON TABLE cms_documents IS 'One row per CMS record. data is the full JSON document (draft + published snapshots).';

-- Keeps list order (newest-first for inquiries, bookings, audit log …) without
-- rewriting every row when one record is added.
CREATE TABLE IF NOT EXISTS cms_collection_order (
  collection TEXT PRIMARY KEY,
  ids TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Singletons: site settings, SEO defaults, email settings, boot-migration flags.
CREATE TABLE IF NOT EXISTS cms_kv (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Uploaded photo bytes. The file on disk is only a cache.
CREATE TABLE IF NOT EXISTS cms_media_blobs (
  media_id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  width INTEGER,
  height INTEGER,
  bytes BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE cms_media_blobs IS 'Binary copy of every CMS upload so photos survive server rebuilds.';

-- Staff accounts: password reset, session revocation, and login lockout.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_reset_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS failed_login_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS notify_bookings BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_inquiries BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS users_reset_token_idx ON users (password_reset_token_hash)
  WHERE password_reset_token_hash IS NOT NULL;

-- Schema drift fixes found while auditing the PostgreSQL mirror.
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS extras JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS faqs_cms_id_idx ON faqs ((extras->>'cms_id'));

ALTER TABLE accommodations DROP CONSTRAINT IF EXISTS accommodations_category_check;
ALTER TABLE accommodations
  ADD CONSTRAINT accommodations_category_check
  CHECK (category IN ('midrange', 'luxury', 'premium-luxury'));

COMMENT ON COLUMN accommodations.category IS 'midrange, luxury, or premium-luxury — same field as CMS lodge.category';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gm_safaris_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON cms_documents, cms_collection_order, cms_kv, cms_media_blobs TO gm_safaris_app;
  END IF;
END $$;
