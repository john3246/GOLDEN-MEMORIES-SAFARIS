-- Party size for quotes: adults, children, and per-child name/age.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS adults INTEGER,
  ADD COLUMN IF NOT EXISTS children INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS child_details JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE bookings
SET adults = COALESCE(adults, travellers)
WHERE adults IS NULL AND travellers IS NOT NULL;

COMMENT ON COLUMN bookings.adults IS 'Number of adults on the safari.';
COMMENT ON COLUMN bookings.children IS 'Number of children on the safari.';
COMMENT ON COLUMN bookings.child_details IS 'Per-child details (name, age) used for park-fee quotes.';
COMMENT ON COLUMN bookings.travellers IS 'Total party size (adults + children).';
