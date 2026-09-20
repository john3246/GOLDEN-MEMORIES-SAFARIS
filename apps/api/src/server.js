import { createApp, publicSiteDir } from './app.js';
import { config } from './config/index.js';
import { logger } from './logging/index.js';
import { bootstrapCms } from './bootstrap/cms.js';
import { sendDueBookingReminders } from './modules/bookings/reminders.js';
import fs from 'node:fs';
import path from 'node:path';

const app = createApp();
const REMINDER_MS = 15 * 60 * 1000;
let reminderTimer;

const server = app.listen(config.port, async () => {
  try {
    await bootstrapCms();
  } catch (err) {
    logger.error('CMS bootstrap failed', { message: err instanceof Error ? err.message : String(err) });
  }
  try {
    await sendDueBookingReminders();
  } catch (err) {
    logger.error('Booking reminder run failed', { message: err instanceof Error ? err.message : String(err) });
  }
  reminderTimer = setInterval(() => {
    sendDueBookingReminders().catch((err) => {
      logger.error('Booking reminder run failed', { message: err instanceof Error ? err.message : String(err) });
    });
  }, REMINDER_MS);
  reminderTimer.unref();
  const publicDir = publicSiteDir();
  const siteBuilt = fs.existsSync(path.join(publicDir, 'index.html'));
  const cmsBuilt = fs.existsSync(path.join(publicDir, 'cms', 'index.html'));
  if (config.servePublic && (!siteBuilt || !cmsBuilt)) {
    logger.error('Public site files missing — CMS will 404 until build:render runs', {
      publicDir,
      siteBuilt,
      cmsBuilt,
    });
  }
  logger.info('GM Safaris API listening', {
    port: config.port,
    nodeEnv: config.nodeEnv,
    servePublic: config.servePublic,
    siteBuilt,
    cmsBuilt,
    externalApiConfigured: config.externalApi.keys.length > 0,
  });
});

function shutdown(signal) {
  logger.info('Shutting down', { signal });
  if (reminderTimer) clearInterval(reminderTimer);
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
