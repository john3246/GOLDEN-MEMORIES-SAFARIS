import path from 'node:path';
import fs from 'node:fs/promises';

/**
 * Resize and convert CMS uploads to WebP so the public site loads faster.
 * Falls back to the original file if sharp is unavailable.
 */
export async function compressUpload(file) {
  if (!file?.path) return file;
  if (!/^image\/(jpeg|png|webp)$/i.test(file.mimetype || '')) return file;
  try {
    const { default: sharp } = await import('sharp');
    const parsed = path.parse(file.path);
    const dest = path.join(parsed.dir, `${parsed.name}.webp`);
    const info = await sharp(file.path)
      .rotate()
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 76, effort: 4 })
      .toFile(dest);
    if (path.resolve(dest) !== path.resolve(file.path)) {
      await fs.unlink(file.path).catch(() => undefined);
    }
    return {
      ...file,
      filename: path.basename(dest),
      path: dest,
      mimetype: 'image/webp',
      size: info.size,
      width: info.width,
      height: info.height,
    };
  } catch {
    return file;
  }
}
