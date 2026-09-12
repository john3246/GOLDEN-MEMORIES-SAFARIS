import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const base = process.env.CMS_BASE || '/';

export default defineConfig({
  root: __dirname,
  base,
  plugins: [tailwindcss()],
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
