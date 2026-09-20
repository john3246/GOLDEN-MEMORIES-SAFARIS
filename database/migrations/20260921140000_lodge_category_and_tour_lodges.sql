-- Lodge category + extra photos, and tour ↔ lodge links.
-- extras JSONB already exists on accommodations; these columns keep the
-- same fields first-class when the CMS moves fully onto PostgreSQL.

ALTER TABLE accommodations
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'midrange';

ALTER TABLE accommodations
  DROP CONSTRAINT IF EXISTS accommodations_category_check;

ALTER TABLE accommodations
  ADD CONSTRAINT accommodations_category_check
  CHECK (category IN ('midrange', 'luxury'));

ALTER TABLE accommodations
  ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS tour_accommodations (
  tour_id UUID NOT NULL,
  accommodation_id UUID NOT NULL REFERENCES accommodations (id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tour_id, accommodation_id)
);

CREATE INDEX IF NOT EXISTS tour_accommodations_lodge_idx ON tour_accommodations (accommodation_id);

COMMENT ON COLUMN accommodations.category IS 'midrange or luxury — same field as CMS lodge.category';
COMMENT ON TABLE tour_accommodations IS 'Links published tours to lodges. CMS also stores lodge_ids on the safari document.';
