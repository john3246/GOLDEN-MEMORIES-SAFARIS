-- Rich blog documents: SEO, featured flag, read time, and relation columns.
-- Draft/published JSON remains the source of truth for block layouts.

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS read_time INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS seo_title TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS keywords TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS canonical_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS og_image TEXT NOT NULL DEFAULT '';

INSERT INTO blog_topics (slug, name, display_order)
VALUES ('itineraries', 'Itineraries', 70)
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS blog_post_lodges (
  post_id UUID NOT NULL REFERENCES blog_posts (id) ON DELETE CASCADE,
  lodge_key TEXT NOT NULL,
  PRIMARY KEY (post_id, lodge_key)
);

CREATE INDEX IF NOT EXISTS blog_posts_featured_idx ON blog_posts (featured, published_on DESC);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gm_safaris_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON blog_posts TO gm_safaris_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON blog_post_lodges TO gm_safaris_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON blog_topics TO gm_safaris_app;
  END IF;
END $$;
