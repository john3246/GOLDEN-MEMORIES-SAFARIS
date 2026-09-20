-- Phase 2: tours / safaris catalog — private, join, Kilimanjaro, day trips, beach.
-- cms_safaris JSON documents remain until the Safari CMS repository writes these tables.

CREATE TABLE tour_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER tour_categories_set_updated_at
  BEFORE UPDATE ON tour_categories
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

INSERT INTO tour_categories (slug, name, display_order) VALUES
  ('wildlife', 'Wildlife Safari Tours', 10),
  ('luxury', 'Luxury Safaris', 20),
  ('cultural', 'Cultural & Historical Tours', 30),
  ('fly-in', 'Fly-in Tanzania Safaris', 40),
  ('honeymoon', 'Honeymoon Packages', 50),
  ('mobile', 'Mobile Camping Safari', 60),
  ('mountain', 'Mountain Climbing & Treks', 70),
  ('photographic', 'Photographic Safaris', 80),
  ('weddings', 'Weddings', 90),
  ('zanzibar', 'Zanzibar & Beach Holidays', 100);

CREATE TABLE climb_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  mountain TEXT NOT NULL DEFAULT 'Kilimanjaro',
  summary TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT '',
  typical_days INTEGER,
  display_order INTEGER NOT NULL DEFAULT 0,
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER climb_routes_set_updated_at
  BEFORE UPDATE ON climb_routes
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

INSERT INTO climb_routes (slug, name, mountain, summary, typical_days, display_order) VALUES
  ('marangu', 'Marangu', 'Kilimanjaro', 'Hut route (Coca-Cola).', 6, 10),
  ('machame', 'Machame', 'Kilimanjaro', 'Camp route via Shira / Barranco.', 7, 20),
  ('lemosho', 'Lemosho', 'Kilimanjaro', 'Scenic western approach, strong acclimatization.', 8, 30),
  ('rongai', 'Rongai', 'Kilimanjaro', 'Drier northern approach.', 7, 40),
  ('umbwe', 'Umbwe', 'Kilimanjaro', 'Steep, direct southern route.', 6, 50),
  ('northern-circuit', 'Northern Circuit', 'Kilimanjaro', 'Longest trail, fullest acclimatization.', 9, 60),
  ('momella', 'Momella', 'Meru', 'Mount Meru via Momella Gate.', 4, 70);

CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  product_type product_type NOT NULL DEFAULT 'private_safari',
  status content_status NOT NULL DEFAULT 'DRAFT',
  title TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  activity_label TEXT NOT NULL DEFAULT '',
  places_label TEXT NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT false,
  most_booked BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  duration_days INTEGER,
  duration_label TEXT NOT NULL DEFAULT '',
  price NUMERIC(12, 2),
  price_from NUMERIC(12, 2),
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  difficulty TEXT NOT NULL DEFAULT '',
  best_season TEXT NOT NULL DEFAULT '',
  minimum_people INTEGER DEFAULT 1,
  maximum_people INTEGER,
  climb_route_id UUID REFERENCES climb_routes (id) ON DELETE SET NULL,
  hero_image_id UUID REFERENCES media (id) ON DELETE SET NULL,
  accommodation_summary TEXT NOT NULL DEFAULT '',
  transport_information TEXT NOT NULL DEFAULT '',
  cta TEXT NOT NULL DEFAULT '',
  map JSONB,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  draft JSONB NOT NULL DEFAULT '{}'::jsonb,
  published JSONB,
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  CONSTRAINT tours_people_check CHECK (
    maximum_people IS NULL OR minimum_people IS NULL OR maximum_people >= minimum_people
  )
);

CREATE TRIGGER tours_set_updated_at
  BEFORE UPDATE ON tours
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX tours_status_idx ON tours (status, featured, display_order);
CREATE INDEX tours_product_idx ON tours (product_type, status);
CREATE INDEX tours_price_idx ON tours (price_from);
CREATE INDEX tours_route_idx ON tours (climb_route_id);
CREATE INDEX tours_duration_idx ON tours (duration_days);

COMMENT ON TABLE tours IS 'Canonical package: private safari, join safari, Kilimanjaro, Meru, day trip, beach, cultural.';
COMMENT ON COLUMN tours.draft IS 'CMS working document (Safari CMS shape). Relational child rows are the queryable truth after publish.';
COMMENT ON COLUMN tours.published IS 'Frozen public snapshot copied on publish.';
COMMENT ON COLUMN tours.extras IS 'Forward-compatible fields (sourceSlug, deposit copy, tags, walk notes).';

CREATE TABLE tour_category_links (
  tour_id UUID NOT NULL REFERENCES tours (id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES tour_categories (id) ON DELETE CASCADE,
  PRIMARY KEY (tour_id, category_id)
);

CREATE TABLE tour_destinations (
  tour_id UUID NOT NULL REFERENCES tours (id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES destinations (id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tour_id, destination_id)
);

CREATE INDEX tour_destinations_destination_idx ON tour_destinations (destination_id);

CREATE TABLE tour_related (
  tour_id UUID NOT NULL REFERENCES tours (id) ON DELETE CASCADE,
  related_tour_id UUID NOT NULL REFERENCES tours (id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tour_id, related_tour_id),
  CONSTRAINT tour_related_no_self CHECK (tour_id <> related_tour_id)
);

CREATE TABLE tour_inclusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  included BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX tour_inclusions_tour_idx ON tour_inclusions (tour_id, included, sort_order);

CREATE TABLE tour_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours (id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX tour_faqs_tour_idx ON tour_faqs (tour_id, sort_order);

CREATE TABLE tour_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours (id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Per person sharing',
  amount NUMERIC(12, 2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  occupancy INTEGER,
  season_label TEXT NOT NULL DEFAULT '',
  valid_from DATE,
  valid_to DATE,
  is_from_price BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER tour_prices_set_updated_at
  BEFORE UPDATE ON tour_prices
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX tour_prices_tour_idx ON tour_prices (tour_id, is_from_price);

CREATE TABLE tour_itinerary_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours (id) ON DELETE CASCADE,
  day_label TEXT NOT NULL,
  day_number INTEGER,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  activities TEXT[] NOT NULL DEFAULT '{}',
  accommodation_id UUID REFERENCES accommodations (id) ON DELETE SET NULL,
  accommodation_text TEXT NOT NULL DEFAULT '',
  meals TEXT NOT NULL DEFAULT '',
  transport TEXT NOT NULL DEFAULT '',
  distance TEXT NOT NULL DEFAULT '',
  viewing TEXT NOT NULL DEFAULT '',
  walk TEXT NOT NULL DEFAULT '',
  iso_date DATE,
  date_label TEXT NOT NULL DEFAULT '',
  image_id UUID REFERENCES media (id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  extras JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX tour_itinerary_days_tour_idx ON tour_itinerary_days (tour_id, sort_order);

CREATE TABLE tour_departures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours (id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  dates_label TEXT NOT NULL DEFAULT '',
  start_date DATE,
  end_date DATE,
  spaces_total INTEGER,
  spaces_taken INTEGER NOT NULL DEFAULT 0,
  spaces_label TEXT NOT NULL DEFAULT '',
  deposit_label TEXT NOT NULL DEFAULT '',
  status content_status NOT NULL DEFAULT 'DRAFT',
  notes TEXT NOT NULL DEFAULT '',
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tour_departures_spaces CHECK (spaces_taken >= 0),
  CONSTRAINT tour_departures_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE TRIGGER tour_departures_set_updated_at
  BEFORE UPDATE ON tour_departures
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX tour_departures_tour_idx ON tour_departures (tour_id, start_date);
CREATE INDEX tour_departures_status_idx ON tour_departures (status, start_date);

COMMENT ON TABLE tour_departures IS 'Join-safari dated or open (null dates) group departures.';

CREATE TABLE tour_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours (id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  action TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_by_email TEXT,
  UNIQUE (tour_id, version)
);

CREATE INDEX tour_revisions_tour_idx ON tour_revisions (tour_id, version DESC);
