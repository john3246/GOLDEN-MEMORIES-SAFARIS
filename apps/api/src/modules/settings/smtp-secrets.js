/**
 * SMTP password typed into CMS → Site settings → Email.
 *
 * Stored encrypted (AES-256-GCM) in the CMS database instead of a loose file
 * on disk, so it survives redeploys and is never sent back to the browser.
 * SMTP_PASS in .env always takes priority. The old smtp.secret.json file is
 * still read once and migrated.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { getCmsDataDir, readStore, updateStore } from '../../cms-store/index.js';
import { encryptSecret, decryptSecret } from '../../security/secrets.js';

const SECRET_FILE = 'smtp.secret.json';

export function normalizeSmtpPass(value) {
  return String(value || '').replace(/\s+/g, '');
}

function secretPath() {
  return path.join(getCmsDataDir(), SECRET_FILE);
}

async function readLegacyFile() {
  try {
    const raw = JSON.parse(await fs.readFile(secretPath(), 'utf8'));
    return normalizeSmtpPass(raw?.pass);
  } catch {
    return '';
  }
}

export async function readSmtpSecret() {
  const store = await readStore();
  const saved = store.settings?.emailSecret;
  if (saved) return { pass: normalizeSmtpPass(await decryptSecret(saved)) };
  const legacy = await readLegacyFile();
  if (legacy) {
    await writeSmtpSecret(legacy);
    await fs.unlink(secretPath()).catch(() => undefined);
  }
  return { pass: legacy };
}

export async function writeSmtpSecret(pass) {
  const clean = normalizeSmtpPass(pass);
  if (!clean) return;
  const encrypted = await encryptSecret(clean);
  await updateStore((store) => {
    store.settings = { ...(store.settings || {}), emailSecret: encrypted };
  });
}

export async function clearSmtpSecret() {
  await updateStore((store) => {
    if (store.settings) delete store.settings.emailSecret;
  });
  await fs.unlink(secretPath()).catch(() => undefined);
}
