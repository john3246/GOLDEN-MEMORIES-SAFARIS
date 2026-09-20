-- Blog documents match safari CMS: draft/published JSON plus listing columns.

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS kicker TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS author TEXT NOT NULL DEFAULT 'Golden Memories Safaris',
  ADD COLUMN IF NOT EXISTS draft JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS published JSONB;

CREATE INDEX IF NOT EXISTS blog_posts_slug_status_idx ON blog_posts (slug, status);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gm_safaris_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON blog_posts TO gm_safaris_app;
  END IF;
END $$;
