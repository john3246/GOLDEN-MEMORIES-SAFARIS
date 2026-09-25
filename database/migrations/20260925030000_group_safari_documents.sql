-- Group Safari packages use the same safari document as private tours
-- (itinerary, gallery, lodges, SEO) plus dated/open departure fields.

CREATE TABLE IF NOT EXISTS cms_departures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'REVIEW', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED')),
  draft JSONB NOT NULL DEFAULT '{}'::jsonb,
  published JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS cms_departures_status_idx ON cms_departures (status, updated_at DESC);

COMMENT ON TABLE cms_departures IS 'File-CMS bridge for Group Safari documents (join_safari).';

ALTER TABLE tour_departures
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS cms_id UUID,
  ADD COLUMN IF NOT EXISTS duration_days INTEGER,
  ADD COLUMN IF NOT EXISTS duration_label TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS price_from NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS currency CHAR(3) NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS overview TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS destination TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS itinerary JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS inclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS exclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS lodge_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faq JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS hero_image JSONB,
  ADD COLUMN IF NOT EXISTS map JSONB,
  ADD COLUMN IF NOT EXISTS draft JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS published JSONB,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS tour_departures_slug_uidx
  ON tour_departures (slug)
  WHERE slug IS NOT NULL AND btrim(slug) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS tour_departures_cms_id_uidx
  ON tour_departures (cms_id)
  WHERE cms_id IS NOT NULL;

COMMENT ON COLUMN tour_departures.draft IS 'CMS working Group Safari document (same shape as a private safari plus dates/spaces).';
COMMENT ON COLUMN tour_departures.published IS 'Frozen public Group Safari snapshot copied on publish.';
COMMENT ON COLUMN tour_departures.itinerary IS 'Day-by-day itinerary JSON, same fields as tour_itinerary_days / safari itinerary.';

CREATE OR REPLACE FUNCTION cms_departures_published_requires_price()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'PUBLISHED' AND GREATEST(safari_json_price(NEW.published), safari_json_price(NEW.draft)) <= 0 THEN
    RAISE EXCEPTION 'A published group safari must have a price';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cms_departures_published_requires_price ON cms_departures;
CREATE TRIGGER cms_departures_published_requires_price
  BEFORE INSERT OR UPDATE ON cms_departures
  FOR EACH ROW
  EXECUTE PROCEDURE cms_departures_published_requires_price();
