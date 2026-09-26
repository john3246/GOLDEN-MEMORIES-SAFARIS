import fs from 'node:fs';
import path from 'node:path';
import { createApp, publicSiteDir } from './app.js';
import { config } from './config/index.js';
import { logger } from './logging/index.js';
import { bootstrapCms } from './bootstrap/cms.js';
import { connectDatabase, closeDatabase } from './database/index.js';
import { initCmsStore, storeBackend } from './cms-store/index.js';
import { startBackgroundJobs, stopBackgroundJobs } from './jobs/index.js';

async function main() {
  if (config.auth.jwtSecretIsEphemeral) {
    logger.warn(
      config.isProduction
        ? 'JWT_SECRET is missing or weak. Using a temporary random key: CMS users are signed out whenever the API restarts. Set a random 48+ character JWT_SECRET.'
        : 'JWT_SECRET in .env is weak or a placeholder. Fine for local testing; set a random 48+ character value before going live.'
    );
  }

  // 1. Database + migrations, 2. choose the CMS store, 3. one-time data tasks.
  const pool = await connectDatabase().catch((err) => {
    logger.error('Database migration failed', { message: err instanceof Error ? err.message : String(err) });
    return null;
  });
  await initCmsStore({ pool });
  try {
    await bootstrapCms();
  } catch (err) {
    logger.error('CMS bootstrap failed', { message: err instanceof Error ? err.message : String(err) });
  }

  const app = createApp();
  const server = app.listen(config.port, () => {
    const publicDir = publicSiteDir();
    const siteBuilt = fs.existsSync(path.join(publicDir, 'index.html'));
    const cmsBuilt = fs.existsSync(path.join(publicDir, 'cms', 'index.html'));
    if (config.servePublic && (!siteBuilt || !cmsBuilt)) {
      logger.error('Public site files missing — run `npm run build:render` so the site and /cms/ can be served', {
        publicDir,
        siteBuilt,
        cmsBuilt,
      });
    }
    logger.info('GM Safaris API listening', {
      url: `http://localhost:${config.port}`,
      nodeEnv: config.nodeEnv,
      servePublic: config.servePublic,
      cmsStore: storeBackend().backend,
      siteBuilt,
      cmsBuilt,
    });
    startBackgroundJobs();
  });
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;

  function shutdown(signal) {
    logger.info('Shutting down', { signal });
    stopBackgroundJobs();
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error('API failed to start', { message: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
