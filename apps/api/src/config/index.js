import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '@gm-safaris/shared-config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '../../../../');

// Values already set in the environment (Render dashboard, `SERVE_PUBLIC=true npm start`,
// test runners) win over .env, so one .env works for every way of starting the API.
dotenv.config({
  path: path.join(monorepoRoot, '.env'),
  override: false,
});

/** @type {ReturnType<typeof loadConfig>} */
export const config = loadConfig(process.env);

export default config;
