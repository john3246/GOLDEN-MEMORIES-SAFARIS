import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allTourSlugs } from './src/pages/tours/catalog.js';
import { allDestinationSlugs } from './src/pages/destinations/catalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function rewriteTourAndDestinationRoutes() {
  return {
    name: 'gm-static-routes',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = (req.url || '').split('?')[0];
        if (url === '/destinations' || url === '/destinations/') {
          req.url = '/destinations/index.html';
        } else if (/^\/destinations\/[a-z0-9-]+\/?$/.test(url)) {
          req.url = '/destinations/index.html';
        } else if (url === '/about' || url === '/about/') {
          req.url = '/about/index.html';
        } else if (url === '/contact' || url === '/contact/') {
          req.url = '/contact/index.html';
        } else if (/^\/tours\/[a-z0-9-]+\/?$/.test(url)) {
          req.url = '/tours/index.html';
        }
        next();
      });
    },
    closeBundle() {
      const toursHtml = path.resolve(__dirname, 'dist/tours/index.html');
      if (fs.existsSync(toursHtml)) {
        const html = fs.readFileSync(toursHtml, 'utf8');
        for (const slug of allTourSlugs()) {
          const dir = path.resolve(__dirname, 'dist/tours', slug);
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, 'index.html'), html);
        }
      }

      const destHtml = path.resolve(__dirname, 'dist/destinations/index.html');
      if (fs.existsSync(destHtml)) {
        const html = fs.readFileSync(destHtml, 'utf8');
        for (const slug of allDestinationSlugs()) {
          const dir = path.resolve(__dirname, 'dist/destinations', slug);
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, 'index.html'), html);
        }
      }
    },
  };
}

/**
 * Vite: lightweight static build for semantic HTML + ES modules.
 * Tailwind via official Vite plugin (no PostCSS boilerplate).
 */
export default defineConfig({
  root: __dirname,
  plugins: [tailwindcss(), rewriteTourAndDestinationRoutes()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 4173,
    open: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        tours: path.resolve(__dirname, 'tours/index.html'),
        destinations: path.resolve(__dirname, 'destinations/index.html'),
        about: path.resolve(__dirname, 'about/index.html'),
        contact: path.resolve(__dirname, 'contact/index.html'),
      },
    },
  },
});
