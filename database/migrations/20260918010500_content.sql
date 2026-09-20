-- Phase 2: pages, blog, FAQs, reviews, menus, team, credentials.

CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  kicker TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  hero_image_id UUID REFERENCES media (id) ON DELETE SET NULL,
  status content_status NOT NULL DEFAULT 'DRAFT',
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE TRIGGER pages_set_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX pages_status_idx ON pages (status);

CREATE TABLE page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages (id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX page_sections_page_idx ON page_sections (page_id, sort_order);

CREATE TABLE blog_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  blurb TEXT NOT NULL DEFAULT '',
  image_id UUID REFERENCES media (id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER blog_topics_set_updated_at
  BEFORE UPDATE ON blog_topics
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

INSERT INTO blog_topics (slug, name, display_order) VALUES
  ('climbing', 'Climbing', 10),
  ('safari', 'Safari', 20),
  ('about-us', 'About us', 30),
  ('about-tanzania', 'About Tanzania', 40),
  ('islands', 'Islands', 50),
  ('wildlife', 'Wildlife', 60);

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES blog_topics (id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  paragraphs TEXT[] NOT NULL DEFAULT '{}',
  image_id UUID REFERENCES media (id) ON DELETE SET NULL,
  published_on DATE,
  status content_status NOT NULL DEFAULT 'DRAFT',
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE TRIGGER blog_posts_set_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX blog_posts_topic_idx ON blog_posts (topic_id);
CREATE INDEX blog_posts_status_idx ON blog_posts (status, published_on DESC);

CREATE TABLE blog_post_tours (
  post_id UUID NOT NULL REFERENCES blog_posts (id) ON DELETE CASCADE,
  tour_id UUID NOT NULL REFERENCES tours (id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tour_id)
);

CREATE TABLE blog_post_destinations (
  post_id UUID NOT NULL REFERENCES blog_posts (id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES destinations (id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, destination_id)
);

CREATE TABLE faq_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

INSERT INTO faq_groups (slug, name, display_order) VALUES
  ('safaris', 'Safaris', 10),
  ('join-safari', 'Join Safari', 20),
  ('kilimanjaro', 'Kilimanjaro', 30),
  ('contact', 'Contact', 40);

CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES faq_groups (id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT '',
  destination_id UUID REFERENCES destinations (id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours (id) ON DELETE CASCADE,
  status content_status NOT NULL DEFAULT 'PUBLISHED',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER faqs_set_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX faqs_group_idx ON faqs (group_id, sort_order);
CREATE INDEX faqs_destination_idx ON faqs (destination_id);
CREATE INDEX faqs_tour_idx ON faqs (tour_id);

CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  trip_detail TEXT NOT NULL DEFAULT '',
  quote TEXT NOT NULL,
  rating SMALLINT CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  source TEXT NOT NULL DEFAULT '',
  tour_id UUID REFERENCES tours (id) ON DELETE SET NULL,
  destination_id UUID REFERENCES destinations (id) ON DELETE SET NULL,
  accommodation_id UUID REFERENCES accommodations (id) ON DELETE SET NULL,
  image_id UUID REFERENCES media (id) ON DELETE SET NULL,
  status content_status NOT NULL DEFAULT 'DRAFT',
  display_order INTEGER NOT NULL DEFAULT 0,
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE TRIGGER testimonials_set_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX testimonials_tour_idx ON testimonials (tour_id);
CREATE INDEX testimonials_status_idx ON testimonials (status, display_order);

CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location menu_location NOT NULL,
  status content_status NOT NULL DEFAULT 'PUBLISHED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (location)
);

CREATE TRIGGER menus_set_updated_at
  BEFORE UPDATE ON menus
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES menus (id) ON DELETE CASCADE,
  parent_id UUID REFERENCES menu_items (id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  href TEXT NOT NULL DEFAULT '/',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX menu_items_menu_idx ON menu_items (menu_id, sort_order);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role_title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  image_id UUID REFERENCES media (id) ON DELETE SET NULL,
  image_alt TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  status content_status NOT NULL DEFAULT 'PUBLISHED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER team_members_set_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  image_id UUID REFERENCES media (id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  status content_status NOT NULL DEFAULT 'PUBLISHED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER credentials_set_updated_at
  BEFORE UPDATE ON credentials
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
