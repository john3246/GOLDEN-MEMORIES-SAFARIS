-- Destination travel fields used by the CMS file store dual-write extras
-- and by any future destinations table readers.

ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'Tanzania',
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS climate JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS getting_there TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS airstrips TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS entry_fees TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS canonical_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS og_image TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN destinations.country IS 'Country label for maps and Schema.org PostalAddress.';
COMMENT ON COLUMN destinations.climate IS '[{title, body}] dry vs rainy season and temperature notes.';
COMMENT ON COLUMN destinations.getting_there IS 'Airport access, road transfers, airstrips.';
COMMENT ON COLUMN destinations.entry_fees IS 'Park fees, permits, and visitor rules.';
