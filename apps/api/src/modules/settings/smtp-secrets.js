import fs from 'node:fs/promises';
import path from 'node:path';
import { getCmsDataDir } from '../../cms-store/index.js';

const SECRET_FILE = 'smtp.secret.json';

export function normalizeSmtpPass(value) {
  return String(value || '').replace(/\s+/g, '');
}

function secretPath() {
  return path.join(getCmsDataDir(), SECRET_FILE);
}

export async function readSmtpSecret() {
  try {
    const raw = JSON.parse(await fs.readFile(secretPath(), 'utf8'));
    return { pass: normalizeSmtpPass(raw?.pass) };
  } catch {
    return { pass: '' };
  }
}

export async function writeSmtpSecret(pass) {
  const clean = normalizeSmtpPass(pass);
  if (!clean) return;
  const file = secretPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify({ pass: clean })}\n`, { encoding: 'utf8', mode: 0o600 });
  try {
    await fs.chmod(file, 0o600);
  } catch {
    /* Windows may ignore mode */
  }
}

export async function clearSmtpSecret() {
  try {
    await fs.unlink(secretPath());
  } catch {
    /* already absent */
  }
}
