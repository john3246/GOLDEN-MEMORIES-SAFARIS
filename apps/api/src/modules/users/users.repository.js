/**
 * Staff users.
 *
 * When the CMS store runs on PostgreSQL, staff accounts live in the relational
 * `users` + `user_roles` tables (source of truth). In the file-store mode used
 * by tests they live in store.users. Callers never need to know which.
 */
import { createId } from '@gm-safaris/shared-utils';
import { CmsRole } from '@gm-safaris/shared-types';
import { readStore, updateStore, storeBackend } from '../../cms-store/index.js';
import { getPool } from '../../database/index.js';
import { hashPassword, verifyPassword } from '../../security/password.js';
import { config } from '../../config/index.js';
import { logger } from '../../logging/index.js';

export const ROLE_IDS = Object.freeze({
  [CmsRole.SUPER_ADMIN]: '00000000-0000-4000-a000-000000000001',
  [CmsRole.ADMIN]: '00000000-0000-4000-a000-000000000002',
  [CmsRole.MANAGER]: '00000000-0000-4000-a000-000000000003',
  [CmsRole.EDITOR]: '00000000-0000-4000-a000-000000000004',
  [CmsRole.VIEWER]: '00000000-0000-4000-a000-000000000005',
});

const ROLE_ORDER = [CmsRole.SUPER_ADMIN, CmsRole.ADMIN, CmsRole.MANAGER, CmsRole.EDITOR, CmsRole.VIEWER];

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

function iso(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone || '',
    status: user.status || (user.disabledAt ? 'disabled' : 'active'),
    notifyBookings: user.notifyBookings === true,
    notifyInquiries: user.notifyInquiries === true,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt || null,
    disabledAt: user.disabledAt || null,
    lastLoginAt: user.lastLoginAt || null,
    locked: Boolean(user.lockedUntil && Date.parse(user.lockedUntil) > Date.now()),
  };
}

function useSql() {
  return storeBackend().backend === 'postgres' && Boolean(getPool());
}

// ---------------------------------------------------------------------------
// SQL backend
// ---------------------------------------------------------------------------

const SELECT_USER = `
  SELECT u.*,
    COALESCE(
      (SELECT r.name FROM user_roles ur JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = u.id ORDER BY r.display_order ASC LIMIT 1),
      'Viewer'
    ) AS role_name
  FROM users u`;

function fromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: String(row.email).toLowerCase(),
    name: row.name,
    role: row.role_name || CmsRole.VIEWER,
    passwordHash: row.password_hash,
    status: row.status === 'disabled' ? 'disabled' : 'active',
    phone: row.phone || '',
    notifyBookings: row.notify_bookings === true,
    notifyInquiries: row.notify_inquiries === true,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    disabledAt: iso(row.disabled_at),
    lastLoginAt: iso(row.last_login_at),
    createdBy: row.created_by || null,
    passwordResetTokenHash: row.password_reset_token_hash || null,
    passwordResetExpires: iso(row.password_reset_expires),
    tokenVersion: Number(row.token_version || 0),
    failedLoginCount: Number(row.failed_login_count || 0),
    lockedUntil: iso(row.locked_until),
  };
}

async function sqlOne(where, params) {
  const result = await getPool().query(`${SELECT_USER} WHERE ${where} LIMIT 1`, params);
  return fromRow(result.rows[0]);
}

async function sqlSetRole(client, userId, role) {
  const roleId = ROLE_IDS[role] || ROLE_IDS[CmsRole.VIEWER];
  await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
  await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, roleId]);
}

async function sqlUpsert(user) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO users (
         id, email, name, password_hash, status, disabled_at, created_at, updated_at,
         password_reset_token_hash, password_reset_expires, token_version,
         failed_login_count, locked_until, last_login_at, phone, notify_bookings, notify_inquiries, created_by
       ) VALUES (
         $1::uuid, $2, $3, $4, $5::user_status, $6::timestamptz, COALESCE($7::timestamptz, now()), now(),
         $8, $9::timestamptz, $10, $11, $12::timestamptz, $13::timestamptz, $14, $15, $16,
         (SELECT id FROM users WHERE id::text = $17 LIMIT 1)
       )
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         status = EXCLUDED.status,
         disabled_at = EXCLUDED.disabled_at,
         password_reset_token_hash = EXCLUDED.password_reset_token_hash,
         password_reset_expires = EXCLUDED.password_reset_expires,
         token_version = EXCLUDED.token_version,
         failed_login_count = EXCLUDED.failed_login_count,
         locked_until = EXCLUDED.locked_until,
         last_login_at = EXCLUDED.last_login_at,
         phone = EXCLUDED.phone,
         notify_bookings = EXCLUDED.notify_bookings,
         notify_inquiries = EXCLUDED.notify_inquiries,
         updated_at = now()
       RETURNING id`,
      [
        user.id,
        user.email,
        user.name,
        user.passwordHash,
        user.status === 'disabled' ? 'disabled' : 'active',
        user.disabledAt || null,
        user.createdAt || null,
        user.passwordResetTokenHash || null,
        user.passwordResetExpires || null,
        Number(user.tokenVersion || 0),
        Number(user.failedLoginCount || 0),
        user.lockedUntil || null,
        user.lastLoginAt || null,
        user.phone || '',
        user.notifyBookings === true,
        user.notifyInquiries === true,
        user.createdBy || '',
      ]
    );
    await sqlSetRole(client, result.rows[0].id, user.role);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
  return sqlOne('u.id = $1::uuid', [user.id]);
}

// ---------------------------------------------------------------------------
// Public repository
// ---------------------------------------------------------------------------

export const usersRepository = {
  async findByEmail(email) {
    const needle = String(email || '').trim().toLowerCase();
    if (!needle) return null;
    if (useSql()) return sqlOne('lower(u.email::text) = $1', [needle]);
    const store = await readStore();
    return store.users.find((user) => user.email === needle) || null;
  },

  async findById(id) {
    if (!id) return null;
    if (useSql()) {
      if (!isUuid(id)) return null;
      return sqlOne('u.id = $1::uuid', [id]);
    }
    const store = await readStore();
    return store.users.find((user) => user.id === id) || null;
  },

  async findByResetTokenHash(tokenHash) {
    const needle = String(tokenHash || '');
    if (!needle) return null;
    if (useSql()) {
      return sqlOne('u.password_reset_token_hash = $1 AND u.password_reset_expires > now()', [needle]);
    }
    const store = await readStore();
    const now = Date.now();
    return (
      store.users.find(
        (user) =>
          user.passwordResetTokenHash === needle &&
          user.passwordResetExpires &&
          Date.parse(user.passwordResetExpires) > now
      ) || null
    );
  },

  async all() {
    if (useSql()) {
      const result = await getPool().query(`${SELECT_USER} ORDER BY u.created_at ASC`);
      return result.rows.map(fromRow);
    }
    const store = await readStore();
    return store.users || [];
  },

  async create({ email, name, role, passwordHash, status = 'active', actorId = null, phone = '' }) {
    const now = new Date().toISOString();
    const user = {
      id: createId(),
      email: String(email).trim().toLowerCase(),
      name,
      role: ROLE_IDS[role] ? role : CmsRole.VIEWER,
      passwordHash,
      phone,
      status: status === 'disabled' ? 'disabled' : 'active',
      createdAt: now,
      updatedAt: now,
      disabledAt: status === 'disabled' ? now : null,
      createdBy: actorId,
      tokenVersion: 0,
      failedLoginCount: 0,
      lockedUntil: null,
      notifyBookings: false,
      notifyInquiries: false,
    };
    if (useSql()) return sqlUpsert(user);
    await updateStore((store) => {
      store.users.push(user);
    });
    return user;
  },

  async save(user) {
    const next = { ...user, updatedAt: new Date().toISOString() };
    if (useSql()) return sqlUpsert(next);
    return updateStore((store) => {
      const index = store.users.findIndex((item) => item.id === user.id);
      if (index === -1) return null;
      store.users[index] = next;
      return next;
    });
  },

  async patch(id, patch) {
    const user = await this.findById(id);
    if (!user) return null;
    return this.save({ ...user, ...patch });
  },

  async setPasswordReset(id, tokenHash, expiresAt) {
    return this.patch(id, { passwordResetTokenHash: tokenHash, passwordResetExpires: expiresAt });
  },

  /** New password also signs the user out everywhere (token version bump). */
  async updatePassword(id, passwordHash) {
    const user = await this.findById(id);
    if (!user) return null;
    return this.save({
      ...user,
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpires: null,
      failedLoginCount: 0,
      lockedUntil: null,
      tokenVersion: Number(user.tokenVersion || 0) + 1,
    });
  },

  async remove(id) {
    if (useSql()) {
      const result = await getPool().query('DELETE FROM users WHERE id = $1::uuid RETURNING id', [id]);
      return result.rowCount > 0;
    }
    return updateStore((store) => {
      const index = store.users.findIndex((item) => item.id === id);
      if (index === -1) return false;
      store.users.splice(index, 1);
      return true;
    });
  },

  toPublic: publicUser,
  ROLE_ORDER,
};

/**
 * Copy staff accounts from the old JSON store into PostgreSQL (once).
 * Password hashes and ids are preserved, so everyone keeps their login.
 */
export async function migrateStoreUsersToSql() {
  if (!useSql()) return 0;
  const store = await readStore();
  const legacy = (store.users || []).filter((user) => user?.email);
  let moved = 0;
  for (const user of legacy) {
    const existing = await usersRepository.findByEmail(user.email);
    if (existing) continue;
    await sqlUpsert({
      ...user,
      id: isUuid(user.id) ? user.id : createId(),
      email: String(user.email).toLowerCase(),
      role: ROLE_IDS[user.role] ? user.role : CmsRole.VIEWER,
      status: user.status === 'disabled' || user.disabledAt ? 'disabled' : 'active',
    });
    moved += 1;
  }
  if (legacy.length) {
    await updateStore((next) => {
      next.users = [];
      next.meta = { ...(next.meta || {}), usersInSql: true };
    });
  }
  if (moved) logger.info('Moved staff users into PostgreSQL', { count: moved });
  return moved;
}

const DEMO_ACCOUNTS = () => [
  { email: config.cms.editorEmail, password: config.cms.editorPassword, fallback: 'ChangeMeEditor!23' },
  { email: config.cms.viewerEmail, password: config.cms.viewerPassword, fallback: 'ChangeMeViewer!23' },
];

/**
 * First boot only: create the initial admin from CMS_ADMIN_EMAIL / CMS_ADMIN_PASSWORD.
 * Existing accounts are never modified — a password changed in the CMS stays changed.
 * Demo editor/viewer accounts that still use the published default passwords are disabled.
 */
export async function seedDefaultUsers() {
  const users = await usersRepository.all();
  if (!users.length) {
    const email = String(config.cms.adminEmail || '').trim().toLowerCase();
    await usersRepository.create({
      email,
      name: 'Site Administrator',
      role: CmsRole.SUPER_ADMIN,
      passwordHash: await hashPassword(config.cms.adminPassword),
    });
    logger.info('Created the first CMS administrator', { email });
    if (process.env.VITEST || process.env.NODE_ENV === 'test') {
      for (const demo of [
        { email: config.cms.editorEmail, name: 'Safari Editor', role: CmsRole.EDITOR, password: config.cms.editorPassword },
        { email: config.cms.viewerEmail, name: 'Safari Viewer', role: CmsRole.VIEWER, password: config.cms.viewerPassword },
      ]) {
        await usersRepository.create({ ...demo, passwordHash: await hashPassword(demo.password) });
      }
    }
    return;
  }

  if (process.env.VITEST || process.env.NODE_ENV === 'test') return;

  // Older builds could only create Admins, so nobody could manage roles.
  // Promote the owner account (CMS_ADMIN_EMAIL, else the first Admin) once.
  if (!users.some((user) => user.role === CmsRole.SUPER_ADMIN && user.status !== 'disabled')) {
    const ownerEmail = String(config.cms.adminEmail || '').trim().toLowerCase();
    const owner =
      users.find((user) => user.email === ownerEmail && user.status !== 'disabled') ||
      users.find((user) => user.role === CmsRole.ADMIN && user.status !== 'disabled');
    if (owner) {
      await usersRepository.save({ ...owner, role: CmsRole.SUPER_ADMIN });
      logger.info('Promoted the site owner to Super Admin', { email: owner.email });
    }
  }

  for (const demo of DEMO_ACCOUNTS()) {
    const user = users.find((item) => item.email === String(demo.email || '').toLowerCase());
    if (!user || user.status === 'disabled') continue;
    const defaults = new Set([demo.fallback, demo.password].filter(Boolean));
    let usesDefault = false;
    for (const candidate of defaults) {
      if (await verifyPassword(candidate, user.passwordHash)) usesDefault = true;
    }
    if (usesDefault) {
      await usersRepository.save({ ...user, status: 'disabled', disabledAt: new Date().toISOString() });
      logger.warn('Disabled demo CMS account that still used its published default password', { email: user.email });
    }
  }
}

/** Emergency reset for a locked-out owner (npm run cms:reset-admin). */
export async function resetAdminFromEnv() {
  const email = String(config.cms.adminEmail || '').trim().toLowerCase();
  const passwordHash = await hashPassword(config.cms.adminPassword);
  const existing = await usersRepository.findByEmail(email);
  if (existing) {
    await usersRepository.save({
      ...existing,
      passwordHash,
      status: 'active',
      disabledAt: null,
      failedLoginCount: 0,
      lockedUntil: null,
      role: existing.role === CmsRole.SUPER_ADMIN ? existing.role : CmsRole.SUPER_ADMIN,
      tokenVersion: Number(existing.tokenVersion || 0) + 1,
    });
    return { email, created: false };
  }
  await usersRepository.create({ email, name: 'Site Administrator', role: CmsRole.SUPER_ADMIN, passwordHash });
  return { email, created: true };
}
