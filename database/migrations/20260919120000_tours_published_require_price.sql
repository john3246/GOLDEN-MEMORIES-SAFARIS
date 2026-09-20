-- Published tours must have a price. Existing rows without a price become drafts.
-- Mirrors the Safari CMS rule so the later JSON → PostgreSQL cutover stays consistent.

CREATE OR REPLACE FUNCTION safari_json_price(doc jsonb)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    CASE
      WHEN NULLIF(doc->>'price_from', '') ~ '^-?[0-9]+(\.[0-9]+)?$'
      THEN (doc->>'price_from')::numeric
    END,
    CASE
      WHEN NULLIF(doc->>'price', '') ~ '^-?[0-9]+(\.[0-9]+)?$'
      THEN (doc->>'price')::numeric
    END,
    0
  );
$$;

UPDATE tours
SET
  status = 'DRAFT',
  published = NULL,
  published_at = NULL,
  updated_at = now()
WHERE status = 'PUBLISHED'
  AND COALESCE(price_from, price, 0) <= 0;

UPDATE cms_safaris
SET
  status = 'DRAFT',
  published = NULL,
  published_at = NULL,
  updated_at = now()
WHERE status = 'PUBLISHED'
  AND GREATEST(safari_json_price(published), safari_json_price(draft)) <= 0;

ALTER TABLE tours DROP CONSTRAINT IF EXISTS tours_published_requires_price;
ALTER TABLE tours
  ADD CONSTRAINT tours_published_requires_price
  CHECK (
    status <> 'PUBLISHED'
    OR COALESCE(price_from, price, 0) > 0
  );

COMMENT ON CONSTRAINT tours_published_requires_price ON tours IS
  'A tour cannot stay published without a price. Same rule as Safari CMS save/publish.';

CREATE OR REPLACE FUNCTION cms_safaris_published_requires_price()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'PUBLISHED' AND GREATEST(safari_json_price(NEW.published), safari_json_price(NEW.draft)) <= 0 THEN
    RAISE EXCEPTION 'A published safari must have a price';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cms_safaris_published_requires_price ON cms_safaris;
CREATE TRIGGER cms_safaris_published_requires_price
  BEFORE INSERT OR UPDATE ON cms_safaris
  FOR EACH ROW
  EXECUTE PROCEDURE cms_safaris_published_requires_price();

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
WHERE t.status = 'PUBLISHED'
  AND COALESCE(t.price_from, t.price, 0) > 0;

COMMENT ON VIEW v_public_tours IS 'Website/external read model. Unpublished tours and tours without a price are excluded.';
