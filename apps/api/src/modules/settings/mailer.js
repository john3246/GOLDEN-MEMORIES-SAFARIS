import { readStore } from '../../cms-store/index.js';
import { DEFAULT_SETTINGS } from '../content/content.seed.js';
import { config } from '../../config/index.js';
import { logger } from '../../logging/index.js';

/** In-memory copies of outbound mail for tests and local debugging. No SMTP passwords. */
export const mailOutbox = [];

export function resetMailOutbox() {
  mailOutbox.length = 0;
}

function remember(entry) {
  mailOutbox.unshift(entry);
  if (mailOutbox.length > 30) mailOutbox.length = 30;
}

async function smtpConfig() {
  const store = await readStore();
  const email = { ...DEFAULT_SETTINGS.email, ...(store.settings?.email || {}) };
  const host = email.smtpHost || config.mail?.host || process.env.SMTP_HOST || '';
  const user = email.smtpUser || config.mail?.user || process.env.SMTP_USER || '';
  const pass = email.smtpPass || config.mail?.pass || process.env.SMTP_PASS || '';
  return {
    ...email,
    smtpHost: host,
    smtpUser: user,
    smtpPass: pass,
    smtpPort: email.smtpPort || process.env.SMTP_PORT || '587',
    smtpSecure: Boolean(email.smtpSecure) || process.env.SMTP_SECURE === 'true',
    fromEmail: email.fromEmail || 'info@gmsafaris.co.tz',
    fromName: email.fromName || 'Golden Memories Safaris',
    settings: store.settings || DEFAULT_SETTINGS,
  };
}

/**
 * Best-effort outbound mail. SMTP comes from CMS settings, then env.
 * Bookings and inquiries are stored even when mail is not configured.
 */
export async function sendSiteMail({ to, subject, text, html, replyTo }) {
  const email = await smtpConfig();
  remember({ to, subject, text, html: Boolean(html), at: new Date().toISOString() });
  if (!email.smtpHost || !to) {
    logger.info('Email skipped (SMTP not configured)', { to, subject });
    return { sent: false, reason: 'smtp-not-configured' };
  }
  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: email.smtpHost,
      port: Number(email.smtpPort || 587),
      secure: Boolean(email.smtpSecure),
      auth: email.smtpUser ? { user: email.smtpUser, pass: email.smtpPass || '' } : undefined,
    });
    await transporter.sendMail({
      from: `"${email.fromName}" <${email.fromEmail || email.smtpUser}>`,
      to,
      replyTo: replyTo || email.replyTo || email.fromEmail,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (err) {
    logger.error('Email send failed', { to, subject, message: err.message });
    return { sent: false, reason: err.message || 'send-failed' };
  }
}

export async function loadMailSettings() {
  const store = await readStore();
  return store.settings || DEFAULT_SETTINGS;
}
