import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const galleryDir = path.resolve(__dirname, '../website-com/public/images');

const base = process.env.CMS_BASE || '/';

function serveWebsiteImages() {
  return {
    name: 'gm-website-images',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (!url.startsWith('/images/')) return next();
        const file = path.join(galleryDir, url.replace(/^\/images/, ''));
        if (!file.startsWith(galleryDir) || !fs.existsSync(file)) return next();
        res.setHeader('Content-Type', 'image/jpeg');
        fs.createReadStream(file).pipe(res);
      });
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
