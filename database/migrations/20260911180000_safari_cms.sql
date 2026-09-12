-- Safari CMS schema (content store).
-- Independent of transactional booking/customer tables.
-- Phase 2 PostgreSQL can apply this; the running CMS uses a file-backed store
-- with the same document shape until the pool is wired.

CREATE TABLE IF NOT EXISTS cms_users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Editor', 'Manager', 'Viewer')),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cms_safaris (
  id UUID PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED')),
  draft JSONB NOT NULL,
  published JSONB,
  created_by UUID REFERENCES cms_users (id),
  updated_by UUID REFERENCES cms_users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS cms_safaris_status_idx ON cms_safaris (status);
CREATE INDEX IF NOT EXISTS cms_safaris_slug_idx ON cms_safaris (slug);

CREATE TABLE IF NOT EXISTS cms_safari_revisions (
  id UUID PRIMARY KEY,
  safari_id UUID NOT NULL REFERENCES cms_safaris (id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  action TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES cms_users (id),
  created_by_email TEXT
);

CREATE TABLE IF NOT EXISTS cms_media (
  id UUID PRIMARY KEY,
  filename TEXT,
  original_name TEXT,
  mime_type TEXT,
  size INTEGER,
  storage_path TEXT,
  external_url TEXT,
  alt TEXT,
  caption TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  created_by UUID REFERENCES cms_users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cms_api_clients (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL,
  scopes JSONB NOT NULL,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES cms_users (id)
);

CREATE TABLE IF NOT EXISTS cms_audit_logs (
  id UUID PRIMARY KEY,
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);
