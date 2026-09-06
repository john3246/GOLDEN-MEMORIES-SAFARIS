import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.js', 'apps/**/*.{test,spec}.js', 'packages/**/*.{test,spec}.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['apps/api/src/**/*.js', 'packages/**/src/**/*.js'],
      exclude: ['**/*.test.js', '**/*.spec.js', '**/index.js'],
    },
  },
});
