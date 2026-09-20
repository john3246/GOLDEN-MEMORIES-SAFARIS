-- Phase 2: staff users and role-based access.
-- Super Admin is a system role; other admins receive Admin / Manager / Editor / Viewer.

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  is_system BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER roles_set_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (module, action)
);

CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions (id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  status user_status NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  disabled_at TIMESTAMPTZ
);

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX users_status_idx ON users (status);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles (id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES users (id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX user_roles_role_idx ON user_roles (role_id);

COMMENT ON TABLE roles IS 'CMS / ops roles. Super Admin cannot be deleted (is_system).';
COMMENT ON TABLE users IS 'Staff accounts only. Guests live in customers.';
COMMENT ON TABLE user_roles IS 'A user may hold more than one role; Super Admin implies all permissions in app code.';

-- System roles (stable ids for seeds and docs).
INSERT INTO roles (id, slug, name, description, is_system, display_order) VALUES
  ('00000000-0000-4000-a000-000000000001', 'super-admin', 'Super Admin',
   'Full platform control: users, roles, settings, API clients, and destructive actions.', true, 10),
  ('00000000-0000-4000-a000-000000000002', 'admin', 'Admin',
   'Manage catalog, content, bookings, and staff except Super Admin / role definitions.', true, 20),
  ('00000000-0000-4000-a000-000000000003', 'manager', 'Manager',
   'Operations: bookings, enquiries, departures, customers, and published content reads.', true, 30),
  ('00000000-0000-4000-a000-000000000004', 'editor', 'Editor',
   'Create, edit, and publish safaris, destinations, blogs, and media. No user or API-key admin.', true, 40),
  ('00000000-0000-4000-a000-000000000005', 'viewer', 'Viewer',
   'Read-only CMS access.', true, 50);

INSERT INTO permissions (key, module, action, description) VALUES
  ('users:read', 'users', 'read', 'View staff users'),
  ('users:write', 'users', 'write', 'Create and update staff users'),
  ('users:delete', 'users', 'delete', 'Disable or remove staff users'),
  ('roles:manage', 'roles', 'manage', 'Create roles and assign permissions'),
  ('safaris:read', 'safaris', 'read', 'View safari / tour documents'),
  ('safaris:write', 'safaris', 'write', 'Create and edit safari / tour drafts'),
  ('safaris:publish', 'safaris', 'publish', 'Publish or unpublish safaris / tours'),
  ('safaris:delete', 'safaris', 'delete', 'Archive or delete safaris / tours'),
  ('destinations:read', 'destinations', 'read', 'View regions and parks'),
  ('destinations:write', 'destinations', 'write', 'Edit destinations'),
  ('destinations:publish', 'destinations', 'publish', 'Publish destinations'),
  ('blog:read', 'blog', 'read', 'View blog'),
  ('blog:write', 'blog', 'write', 'Edit blog'),
  ('blog:publish', 'blog', 'publish', 'Publish blog'),
  ('pages:read', 'pages', 'read', 'View pages and menus'),
  ('pages:write', 'pages', 'write', 'Edit pages and menus'),
  ('pages:publish', 'pages', 'publish', 'Publish pages'),
  ('media:manage', 'media', 'manage', 'Upload and manage media'),
  ('accommodations:read', 'accommodations', 'read', 'View lodges and camps'),
  ('accommodations:write', 'accommodations', 'write', 'Edit lodges and camps'),
  ('bookings:read', 'bookings', 'read', 'View bookings'),
  ('bookings:write', 'bookings', 'write', 'Create and update bookings'),
  ('bookings:manage', 'bookings', 'manage', 'Confirm, cancel, and refund bookings'),
  ('enquiries:read', 'enquiries', 'read', 'View enquiries'),
  ('enquiries:write', 'enquiries', 'write', 'Update enquiry status and notes'),
  ('customers:read', 'customers', 'read', 'View customers'),
  ('customers:write', 'customers', 'write', 'Edit customers'),
  ('reviews:read', 'reviews', 'read', 'View testimonials'),
  ('reviews:write', 'reviews', 'write', 'Edit testimonials'),
  ('faqs:read', 'faqs', 'read', 'View FAQs'),
  ('faqs:write', 'faqs', 'write', 'Edit FAQs'),
  ('departures:read', 'departures', 'read', 'View join-safari departures'),
  ('departures:write', 'departures', 'write', 'Edit join-safari departures'),
  ('vehicles:read', 'vehicles', 'read', 'View vehicles'),
  ('vehicles:write', 'vehicles', 'write', 'Edit vehicles'),
  ('settings:manage', 'settings', 'manage', 'Change site and email settings'),
  ('api_clients:manage', 'api_clients', 'manage', 'Issue and revoke external API keys'),
  ('audit:read', 'audit', 'read', 'Read audit logs');

-- Super Admin: every permission.
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-4000-a000-000000000001', id FROM permissions;

-- Admin: everything except role definitions and Super-Admin-only user delete is still granted;
-- app code must still prevent demoting the last Super Admin.
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-4000-a000-000000000002', id FROM permissions
WHERE key NOT IN ('roles:manage');

-- Manager: ops + read catalog.
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-4000-a000-000000000003', id FROM permissions
WHERE key IN (
  'safaris:read', 'destinations:read', 'blog:read', 'pages:read',
  'accommodations:read', 'reviews:read', 'faqs:read',
  'bookings:read', 'bookings:write', 'bookings:manage',
  'enquiries:read', 'enquiries:write',
  'customers:read', 'customers:write',
  'departures:read', 'departures:write',
  'vehicles:read', 'vehicles:write',
  'media:manage', 'audit:read'
);

-- Editor: content, no bookings admin, no API keys, no user admin.
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-4000-a000-000000000004', id FROM permissions
WHERE key IN (
  'safaris:read', 'safaris:write', 'safaris:publish',
  'destinations:read', 'destinations:write', 'destinations:publish',
  'blog:read', 'blog:write', 'blog:publish',
  'pages:read', 'pages:write', 'pages:publish',
  'media:manage',
  'accommodations:read', 'accommodations:write',
  'reviews:read', 'reviews:write',
  'faqs:read', 'faqs:write',
  'departures:read', 'departures:write'
);

-- Viewer: published-style reads only (no staff directory).
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-4000-a000-000000000005', id FROM permissions
WHERE key IN (
  'safaris:read',
  'destinations:read',
  'blog:read',
  'pages:read',
  'accommodations:read',
  'reviews:read',
  'faqs:read',
  'bookings:read',
  'enquiries:read',
  'customers:read',
  'departures:read',
  'vehicles:read',
  'audit:read'
);
