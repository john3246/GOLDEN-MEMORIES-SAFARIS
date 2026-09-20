import { CmsRole } from '@gm-safaris/shared-types';
import { getPool } from '../../database/index.js';
import { logger } from '../../logging/index.js';

const ROLE_IDS = {
  [CmsRole.SUPER_ADMIN]: '00000000-0000-4000-a000-000000000001',
  [CmsRole.ADMIN]: '00000000-0000-4000-a000-000000000002',
  [CmsRole.MANAGER]: '00000000-0000-4000-a000-000000000003',
  [CmsRole.EDITOR]: '00000000-0000-4000-a000-000000000004',
  [CmsRole.VIEWER]: '00000000-0000-4000-a000-000000000005',
};

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

export async function syncStaffUser(user) {
  if (process.env.VITEST === 'true' || process.env.NODE_ENV === 'test') return;
  const pool = getPool();
  if (!pool || !user?.email) return;
  const roleId = ROLE_IDS[user.role];
  const status = user.status === 'disabled' ? 'disabled' : 'active';
  const id = isUuid(user.id) ? user.id : null;
  try {
    const result = await pool.query(
      `INSERT INTO users (id, email, name, password_hash, status, disabled_at, created_at, updated_at)
       VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4, $5::user_status, $6::timestamptz, COALESCE($7::timestamptz, now()), now())
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         status = EXCLUDED.status,
         disabled_at = EXCLUDED.disabled_at,
         updated_at = now()
       RETURNING id`,
      [id, user.email, user.name, user.passwordHash, status, user.disabledAt, user.createdAt]
    );
    const userId = result.rows[0]?.id;
    if (userId && roleId) {
      await pool.query(`DELETE FROM user_roles WHERE user_id = $1`, [userId]);
      await pool.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
        userId,
        roleId,
      ]);
    }
  } catch (err) {
    logger.warn('Staff user PostgreSQL sync skipped', { message: err instanceof Error ? err.message : String(err) });
  }
}
