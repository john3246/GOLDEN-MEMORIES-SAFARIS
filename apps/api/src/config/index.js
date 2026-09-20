import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '@gm-safaris/shared-config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '../../../../');

dotenv.config({
  path: path.join(monorepoRoot, '.env'),
  override: process.env.NODE_ENV !== 'production',
});

/** @type {ReturnType<typeof loadConfig>} */
export const config = loadConfig(process.env);

export default config;
