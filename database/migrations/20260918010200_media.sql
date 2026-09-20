-- Phase 2: media library. cms_media remains until the CMS repository switches (Phase 8).

CREATE TABLE media_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES media_folders (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_id, slug)
);

CREATE TRIGGER media_folders_set_updated_at
  BEFORE UPDATE ON media_folders
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES media_folders (id) ON DELETE SET NULL,
  filename TEXT,
  original_name TEXT,
  mime_type TEXT,
  size INTEGER,
  storage_path TEXT,
  external_url TEXT,
  alt TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  visibility media_visibility NOT NULL DEFAULT 'private',
  width INTEGER,
  height INTEGER,
  checksum TEXT,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT media_has_source CHECK (
    (storage_path IS NOT NULL AND storage_path <> '')
    OR (external_url IS NOT NULL AND external_url <> '')
  )
);

CREATE TRIGGER media_set_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX media_folder_idx ON media (folder_id);
CREATE INDEX media_visibility_idx ON media (visibility);
CREATE INDEX media_mime_idx ON media (mime_type);

CREATE TABLE media_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES media (id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  role media_role NOT NULL DEFAULT 'gallery',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (resource_type, resource_id, media_id, role)
);

CREATE INDEX media_links_resource_idx ON media_links (resource_type, resource_id);
CREATE INDEX media_links_media_idx ON media_links (media_id);

COMMENT ON TABLE media IS 'Canonical media assets. Public site should only use visibility = public.';
COMMENT ON TABLE media_links IS 'Attaches media to tours, destinations, posts, pages, lodges, itinerary days.';
