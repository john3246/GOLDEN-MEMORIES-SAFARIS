/**
 * Where uploaded photos live.
 *
 * Old builds stored `storagePath` as a path relative to whatever folder the
 * API was started from (e.g. "uploads\\abc.webp" on Windows). Starting the API
 * from the repo root, from apps/api, or on Linux then broke every upload.
 * Now:
 *   - files are written to an ABSOLUTE upload folder (apps/api/uploads by default)
 *   - only the file name is stored on the media record
 *   - the bytes are also saved in PostgreSQL (cms_media_blobs), so photos
 *     survive a redeploy on hosts whose disk is wiped (Render, etc.)
 */
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../../config/index.js';
import { getPool } from '../../database/index.js';
import { storeBackend } from '../../cms-store/index.js';
import { logger } from '../../logging/index.js';

const API_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

export const MIME_BY_EXT = Object.freeze({
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
});

export function uploadDir() {
  const configured = config.media.uploadDir || './uploads';
  return path.isAbsolute(configured) ? configured : path.resolve(API_ROOT, configured);
}

export function mimeForFile(name, fallback = 'application/octet-stream') {
  return MIME_BY_EXT[path.extname(String(name || '')).toLowerCase()] || fallback;
}

function dbEnabled() {
  return storeBackend().backend === 'postgres' && Boolean(getPool());
}

function safeName(name) {
  const base = path.basename(String(name || '').replace(/\\/g, '/'));
  return /^[A-Za-z0-9._-]+$/.test(base) ? base : '';
}

/** Candidate disk paths for a media record, newest convention first. */
export function candidatePaths(item) {
  const out = [];
  const dir = uploadDir();
  const byName = safeName(item?.filename);
  if (byName) out.push(path.join(dir, byName));
  const legacy = String(item?.storagePath || '').replace(/\\/g, '/');
  if (legacy) {
    const legacyName = safeName(legacy);
    if (legacyName) out.push(path.join(dir, legacyName));
    if (path.isAbsolute(legacy)) out.push(legacy);
    else {
      out.push(path.resolve(API_ROOT, legacy));
      out.push(path.resolve(process.cwd(), legacy));
    }
  }
  return [...new Set(out)];
}

export function findOnDisk(item) {
  for (const candidate of candidatePaths(item)) {
    try {
      const stat = fsSync.statSync(candidate);
      if (stat.isFile() && stat.size > 0) return candidate;
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function writeUpload(filename, buffer) {
  const dir = uploadDir();
  await fs.mkdir(dir, { recursive: true });
  const dest = path.join(dir, safeName(filename));
  await fs.writeFile(dest, buffer);
  return dest;
}

export async function saveBlob(item, buffer) {
  if (!dbEnabled() || !buffer?.length) return false;
  await getPool().query(
    `INSERT INTO cms_media_blobs (media_id, filename, mime_type, size, width, height, bytes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (media_id) DO UPDATE SET
       filename = EXCLUDED.filename, mime_type = EXCLUDED.mime_type, size = EXCLUDED.size,
       width = EXCLUDED.width, height = EXCLUDED.height, bytes = EXCLUDED.bytes`,
    [
      item.id,
      item.filename,
      item.mimeType || mimeForFile(item.filename),
      buffer.length,
      item.width || null,
      item.height || null,
      buffer,
    ]
  );
  return true;
}

export async function loadBlob(id) {
  if (!dbEnabled()) return null;
  const result = await getPool().query('SELECT filename, mime_type, bytes FROM cms_media_blobs WHERE media_id = $1', [id]);
  return result.rows[0] || null;
}

export async function deleteStoredFile(item) {
  for (const candidate of candidatePaths(item)) {
    await fs.unlink(candidate).catch(() => undefined);
  }
  if (dbEnabled()) {
    await getPool().query('DELETE FROM cms_media_blobs WHERE media_id = $1', [item.id]).catch(() => undefined);
  }
}

/**
 * Copy existing uploads into PostgreSQL once (and fix old storage paths).
 * @param {Array<Record<string, any>>} mediaItems
 */
export async function backfillMediaBlobs(mediaItems) {
  if (!dbEnabled()) return { saved: 0, missing: [] };
  const existing = await getPool().query('SELECT media_id FROM cms_media_blobs');
  const have = new Set(existing.rows.map((row) => row.media_id));
  let saved = 0;
  const missing = [];
  for (const item of mediaItems || []) {
    if (item.externalUrl || have.has(item.id)) continue;
    const file = findOnDisk(item);
    if (!file) {
      missing.push(item.filename || item.id);
      continue;
    }
    const buffer = await fs.readFile(file);
    await saveBlob({ ...item, mimeType: mimeForFile(file, item.mimeType) }, buffer);
    saved += 1;
  }
  if (saved) logger.info('Copied uploaded photos into PostgreSQL', { saved });
  if (missing.length) logger.warn('Some uploaded photos are missing on disk and in the database', { missing });
  return { saved, missing };
}
