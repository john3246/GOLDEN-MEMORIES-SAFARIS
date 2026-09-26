/**
 * Locked out of the CMS? Reset (or create) the owner account from
 * CMS_ADMIN_EMAIL / CMS_ADMIN_PASSWORD in .env. Signs out all sessions for it.
 *
 * Usage: npm run cms:reset-admin
 */
process.env.DISABLE_JOBS = 'true';
const { connectDatabase, closeDatabase } = await import('../apps/api/src/database/index.js');
const { initCmsStore } = await import('../apps/api/src/cms-store/index.js');
const { resetAdminFromEnv } = await import('../apps/api/src/modules/users/users.repository.js');
const pool = await connectDatabase();
await initCmsStore({ pool });
const result = await resetAdminFromEnv();
console.log(`${result.created ? 'Created' : 'Reset'} CMS owner account ${result.email} (Super Admin). Sign in with CMS_ADMIN_PASSWORD from .env, then change it under My profile.`);
await closeDatabase();
process.exit(0);
