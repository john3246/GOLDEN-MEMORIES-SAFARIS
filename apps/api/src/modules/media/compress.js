/**
 * Validate and optimise a CMS upload.
 *
 * - The browser-supplied MIME type is NOT trusted: sharp must be able to read
 *   the bytes as a real raster image, otherwise the upload is rejected
 *   (stops HTML/SVG/script files renamed to .jpg).
 * - JPEG / PNG / WebP / AVIF are auto-rotated, resized to max 2000px and saved
 *   as WebP (quality 80) — typically 5–10× smaller than camera JPEGs.
 * - Animated GIFs are kept as-is so they still animate.
 */
import { validationError } from '../../errors/index.js';

const MAX_EDGE = 2000;
const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'gif', 'avif', 'heif']);

/**
 * @param {Buffer} buffer
 * @returns {Promise<{ buffer: Buffer, ext: string, mimeType: string, width: number|null, height: number|null }>}
 */
export async function processImage(buffer) {
  if (!buffer?.length) throw validationError('The uploaded file is empty');
  let sharp;
  try {
    ({ default: sharp } = await import('sharp'));
  } catch {
    throw validationError('Image processing is unavailable on this server (sharp is not installed)');
  }

  let meta;
  try {
    meta = await sharp(buffer, { animated: true, limitInputPixels: 80_000_000 }).metadata();
  } catch {
    throw validationError('That file is not a valid image. Upload a JPG, PNG, WebP or GIF photo.');
  }
  if (!ALLOWED_FORMATS.has(meta.format)) {
    throw validationError('Unsupported image type. Upload a JPG, PNG, WebP or GIF photo.');
  }
  if ((meta.width || 0) < 20 || (meta.height || 0) < 20) {
    throw validationError('That image is too small to use on the website.');
  }

  if (meta.format === 'gif' && (meta.pages || 1) > 1) {
    return { buffer, ext: '.gif', mimeType: 'image/gif', width: meta.width || null, height: meta.pageHeight || meta.height || null };
  }

  const { data, info } = await sharp(buffer, { limitInputPixels: 80_000_000 })
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toBuffer({ resolveWithObject: true });
  return { buffer: data, ext: '.webp', mimeType: 'image/webp', width: info.width, height: info.height };
}

/** Back-compat for callers that pass a multer disk file. */
export async function compressUpload(file) {
  return file;
}
