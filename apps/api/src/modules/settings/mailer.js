import { readStore } from '../../cms-store/index.js';
import { DEFAULT_SETTINGS } from '../content/content.seed.js';
import { config } from '../../config/index.js';
import { logger } from '../../logging/index.js';
import { normalizeSmtpPass, readSmtpSecret } from './smtp-secrets.js';

/** In-memory copies of outbound mail for tests and local debugging. No SMTP passwords. */
export const mailOutbox = [];

export function resetMailOutbox() {
  mailOutbox.length = 0;
}

function remember(entry) {
  mailOutbox.unshift(entry);
  if (mailOutbox.length > 30) mailOutbox.length = 30;
}

function envMail() {
  return {
    host: String(config.mail?.host || process.env.SMTP_HOST || '').trim(),
    port: String(config.mail?.port || process.env.SMTP_PORT || '587'),
    user: String(config.mail?.user || process.env.SMTP_USER || '').trim(),
    pass: normalizeSmtpPass(config.mail?.pass || process.env.SMTP_PASS || ''),
    secure: Boolean(config.mail?.secure) || process.env.SMTP_SECURE === 'true',
    requireTls: config.mail?.requireTls !== false && process.env.SMTP_REQUIRE_TLS !== 'false',
    fromName: config.mail?.fromName || process.env.SMTP_FROM_NAME || '',
    fromEmail: config.mail?.fromEmail || process.env.SMTP_FROM_EMAIL || '',
  };
}

function transportOptions({ host, port, user, pass, secure, requireTls }) {
  const n = Number(port || 587);
  const implicitSsl = Boolean(secure) || n === 465;
  return {
    host,
    port: n,
    secure: implicitSsl,
    requireTLS: !implicitSsl && (requireTls || n === 587),
    auth: user ? { user, pass: pass || '' } : undefined,
    tls: {
      minVersion: 'TLSv1.2',
      servername: host,
    },
  };
}

function skipLiveTransport() {
  return (
    Boolean(process.env.VITEST) ||
    process.env.NODE_ENV === 'test' ||
    process.env.SMTP_DRY_RUN === 'true'
  );
}

export async function smtpConfig() {
  const store = await readStore();
  const stored = { ...DEFAULT_SETTINGS.email, ...(store.settings?.email || {}) };
  const env = envMail();
  const secret = await readSmtpSecret();
  const host = env.host || stored.smtpHost || '';
  const user = env.user || stored.smtpUser || '';
  const pass = env.pass || secret.pass || '';
  const port = env.host ? env.port : stored.smtpPort || env.port || '587';
  const secure = env.host ? env.secure : Boolean(stored.smtpSecure) || env.secure;
  return {
    ...stored,
    smtpHost: host,
    smtpUser: user,
    smtpPass: pass,
    smtpPort: String(port || '587'),
    smtpSecure: Boolean(secure),
    requireTls: env.requireTls,
    fromEmail: stored.fromEmail || env.fromEmail || user || 'info@gmsafaris.co.tz',
    fromName: stored.fromName || env.fromName || 'Golden Memories Safaris',
    envLocked: Boolean(env.host && env.user && env.pass),
    configured: Boolean(host && user && pass),
    settings: store.settings || DEFAULT_SETTINGS,
  };
}

/**
 * Best-effort outbound mail. SMTP secrets come from env, then a gitignored secret file.
 * Bookings and inquiries are stored even when mail is not configured.
 */
export async function sendSiteMail({ to, subject, text, html, replyTo }) {
  const email = await smtpConfig();
  remember({ to, subject, text, html: Boolean(html), at: new Date().toISOString() });
  if (!email.smtpHost || !email.smtpUser || !email.smtpPass || !to) {
    logger.info('Email skipped (SMTP not configured)', { to, subject });
    return { sent: false, reason: 'smtp-not-configured' };
  }
  if (skipLiveTransport()) {
    return { sent: true, dryRun: true };
  }
  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport(
      transportOptions({
        host: email.smtpHost,
        port: email.smtpPort,
        user: email.smtpUser,
        pass: email.smtpPass,
        secure: email.smtpSecure,
        requireTls: email.requireTls,
      })
    );
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

export async function verifySmtp() {
  const email = await smtpConfig();
  if (!email.configured) return { ok: false, reason: 'smtp-not-configured' };
  if (skipLiveTransport()) return { ok: true, dryRun: true };
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport(
    transportOptions({
      host: email.smtpHost,
      port: email.smtpPort,
      user: email.smtpUser,
      pass: email.smtpPass,
      secure: email.smtpSecure,
      requireTls: email.requireTls,
    })
  );
  await transporter.verify();
  return { ok: true };
}

export async function loadMailSettings() {
  const store = await readStore();
  return store.settings || DEFAULT_SETTINGS;
}
