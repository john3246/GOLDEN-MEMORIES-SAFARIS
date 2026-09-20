-- Phase 2: SEO, settings, audit, grants, and bridges onto existing cms_* tables.

CREATE TABLE seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type seo_resource_type NOT NULL,
  resource_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  canonical TEXT NOT NULL DEFAULT '',
  og_title TEXT NOT NULL DEFAULT '',
  og_description TEXT NOT NULL DEFAULT '',
  og_image_id UUID REFERENCES media (id) ON DELETE SET NULL,
  robots TEXT NOT NULL DEFAULT 'index,follow',
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (resource_type, resource_id)
);

CREATE TRIGGER seo_metadata_set_updated_at
  BEFORE UPDATE ON seo_metadata
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES users (id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER site_settings_set_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

INSERT INTO site_settings (key, value) VALUES
  ('site', jsonb_build_object(
    'name', 'Golden Memories Safaris',
    'shortName', 'GM Safaris',
    'tagline', 'Your Culture or Ours',
    'phone', '+255 786 383 273',
    'phoneAlt', '+255 754 750 070',
    'email', 'info@gmsafaris.co.tz',
    'address', 'Njiro, Arusha, Tanzania',
    'socials', '[]'::jsonb
  )),
  ('seo', jsonb_build_object(
    'defaultTitle', 'Golden Memories Safaris – Tanzania Safaris Experts',
    'defaultDescription', 'Golden Memories Safaris — premier Tanzania wildlife safaris, Kilimanjaro treks, and Zanzibar beach holidays crafted by experts in Arusha.'
  )),
  ('websiteLive', 'true'::jsonb);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users (id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_created_idx ON audit_logs (created_at DESC);
CREATE INDEX audit_logs_resource_idx ON audit_logs (resource, resource_id);
CREATE INDEX audit_logs_actor_idx ON audit_logs (actor_id);

-- Bridge existing Safari CMS tables without rewriting them.
ALTER TABLE cms_users
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users (id) ON DELETE SET NULL;

ALTER TABLE cms_safaris
  ADD COLUMN IF NOT EXISTS tour_id UUID REFERENCES tours (id) ON DELETE SET NULL;

ALTER TABLE cms_media
  ADD COLUMN IF NOT EXISTS media_id UUID REFERENCES media (id) ON DELETE SET NULL;

ALTER TABLE cms_media
  ADD COLUMN IF NOT EXISTS width INTEGER,
  ADD COLUMN IF NOT EXISTS height INTEGER;

ALTER TABLE cms_users DROP CONSTRAINT IF EXISTS cms_users_role_check;
ALTER TABLE cms_users
  ADD CONSTRAINT cms_users_role_check
  CHECK (role IN ('Super Admin', 'Admin', 'Editor', 'Manager', 'Viewer'));

CREATE INDEX IF NOT EXISTS cms_safaris_tour_idx ON cms_safaris (tour_id);
CREATE INDEX IF NOT EXISTS cms_users_user_idx ON cms_users (user_id);

CREATE OR REPLACE VIEW v_public_tours AS
SELECT
  t.id,
  t.slug,
  t.product_type,
  t.title,
  t.short_description,
  t.activity_label,
  t.places_label,
  t.featured,
  t.most_booked,
  t.duration_days,
  t.duration_label,
  t.price_from,
  t.currency,
  t.climb_route_id,
  t.hero_image_id,
  t.published,
  t.published_at
FROM tours t
WHERE t.status = 'PUBLISHED';

COMMENT ON VIEW v_public_tours IS 'External / website read model. Never expose unpublished rows.';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gm_safaris_app') THEN
    GRANT USAGE ON SCHEMA public TO gm_safaris_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gm_safaris_app;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO gm_safaris_app;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gm_safaris_app;
    GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO gm_safaris_app;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO gm_safaris_app;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT USAGE, SELECT ON SEQUENCES TO gm_safaris_app;
  END IF;
END $$;
