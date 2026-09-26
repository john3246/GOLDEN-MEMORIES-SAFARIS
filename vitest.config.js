import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.js', 'apps/**/*.{test,spec}.js', 'packages/**/*.{test,spec}.js'],
    env: {
      CMS_SEED_SAFARIS: 'false',
      CMS_SYNC_POSTGRES: 'false',
      BCRYPT_ROUNDS: '4',
      CMS_ADMIN_EMAIL: 'info@gms.co.tz',
      CMS_ADMIN_PASSWORD: '1234gms',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['apps/api/src/**/*.js', 'packages/**/src/**/*.js'],
      exclude: ['**/*.test.js', '**/*.spec.js', '**/index.js'],
    },
  },
});
