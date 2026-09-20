-- Phase 2: regions, parks/places, and lodges/camps.

CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kicker TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  blurb TEXT NOT NULL DEFAULT '',
  image_id UUID REFERENCES media (id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  status content_status NOT NULL DEFAULT 'DRAFT',
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE TRIGGER regions_set_updated_at
  BEFORE UPDATE ON regions
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX regions_status_idx ON regions (status, display_order);

CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES regions (id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kicker TEXT NOT NULL DEFAULT '',
  tagline TEXT NOT NULL DEFAULT '',
  cta TEXT NOT NULL DEFAULT '',
  location_label TEXT NOT NULL DEFAULT '',
  blurb TEXT NOT NULL DEFAULT '',
  image_id UUID REFERENCES media (id) ON DELETE SET NULL,
  paragraphs TEXT[] NOT NULL DEFAULT '{}',
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  seasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  wildlife TEXT[] NOT NULL DEFAULT '{}',
  activities JSONB NOT NULL DEFAULT '[]'::jsonb,
  attractions TEXT[] NOT NULL DEFAULT '{}',
  facts JSONB NOT NULL DEFAULT '[]'::jsonb,
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  match_terms TEXT[] NOT NULL DEFAULT '{}',
  status content_status NOT NULL DEFAULT 'DRAFT',
  display_order INTEGER NOT NULL DEFAULT 0,
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE TRIGGER destinations_set_updated_at
  BEFORE UPDATE ON destinations
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX destinations_region_idx ON destinations (region_id);
CREATE INDEX destinations_status_idx ON destinations (status, display_order);
CREATE INDEX destinations_match_gin ON destinations USING GIN (match_terms);

COMMENT ON COLUMN destinations.highlights IS '[{title, body}]';
COMMENT ON COLUMN destinations.seasons IS '[{title, body}]';
COMMENT ON COLUMN destinations.activities IS '[{title, body}]';
COMMENT ON COLUMN destinations.facts IS '[{label, value}] or legacy [label, value] pairs';
COMMENT ON COLUMN destinations.faqs IS '[{q, a}]';
COMMENT ON COLUMN destinations.match_terms IS 'Keywords used to attach related tours.';
COMMENT ON COLUMN destinations.extras IS 'Forward-compatible fields without a new migration.';

CREATE TABLE accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID REFERENCES destinations (id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kind accommodation_kind NOT NULL DEFAULT 'lodge',
  place_label TEXT NOT NULL DEFAULT '',
  blurb TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image_id UUID REFERENCES media (id) ON DELETE SET NULL,
  website_url TEXT,
  status content_status NOT NULL DEFAULT 'DRAFT',
  display_order INTEGER NOT NULL DEFAULT 0,
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE TRIGGER accommodations_set_updated_at
  BEFORE UPDATE ON accommodations
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX accommodations_destination_idx ON accommodations (destination_id);
CREATE INDEX accommodations_status_idx ON accommodations (status, kind);
