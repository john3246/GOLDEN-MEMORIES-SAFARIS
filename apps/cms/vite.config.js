import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const galleryDir = path.resolve(__dirname, '../website-com/public/images');

const base = process.env.CMS_BASE || '/';

const IMAGE_TYPES = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

function servePublicImage(req, res, next) {
  const url = decodeURIComponent((req.url || '').split('?')[0] || '');
  if (!url.startsWith('/images/')) return next();
  const relative = url.replace(/^\/images\/?/, '').replace(/\\/g, '/');
  if (!relative || relative.split('/').some((part) => part === '..')) return next();
  const file = path.resolve(galleryDir, ...relative.split('/').filter(Boolean));
  const rel = path.relative(galleryDir, file);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return next();
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return next();
  res.setHeader('Content-Type', IMAGE_TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  fs.createReadStream(file).pipe(res);
}

function serveWebsiteImages() {
  return {
    name: 'gm-website-images',
    configureServer(server) {
      server.middlewares.use(servePublicImage);
    },
    configurePreviewServer(server) {
      server.middlewares.use(servePublicImage);
    },
  };
}

export default defineConfig({
  root: __dirname,
  base,
  plugins: [tailwindcss(), serveWebsiteImages()],
  resolve: {
    alias: {
      '@site-styles': path.resolve(__dirname, '../website-com/src/styles/main.css'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
    },
  },
  preview: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
