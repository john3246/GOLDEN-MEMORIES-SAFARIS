/**
 * Background jobs (single API process).
 * - booking reminders every 15 minutes
 * - outbound webhook retries every minute
 * - review import (Google / TripAdvisor) every 12 hours
 */
import { logger } from '../logging/index.js';

const timers = [];

function every(ms, name, fn, { runNow = false, delayMs = 0 } = {}) {
  const run = () =>
    Promise.resolve()
      .then(fn)
      .catch((err) => logger.error(`${name} failed`, { message: err instanceof Error ? err.message : String(err) }));
  if (runNow) setTimeout(run, delayMs).unref();
  const timer = setInterval(run, ms);
  timer.unref();
  timers.push(timer);
}

export function startBackgroundJobs() {
  if (process.env.VITEST || process.env.DISABLE_JOBS === 'true') return;
  every(
    15 * 60 * 1000,
    'Booking reminders',
    async () => (await import('../modules/bookings/reminders.js')).sendDueBookingReminders(),
    { runNow: true, delayMs: 5_000 }
  );
  every(
    60 * 1000,
    'Webhook retries',
    async () => (await import('../modules/webhooks/webhooks.service.js')).retryPendingDeliveries()
  );
  every(
    12 * 60 * 60 * 1000,
    'Review import',
    async () => (await import('../modules/reviews/reviews.service.js')).syncAllSources({ reason: 'schedule' }),
    { runNow: true, delayMs: 30_000 }
  );
}

export function stopBackgroundJobs() {
  while (timers.length) clearInterval(timers.pop());
}
