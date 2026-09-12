import { seedDefaultUsers } from '../modules/users/index.js';
import { seedSafariPackages } from '../modules/safaris/index.js';
import { logger } from '../logging/index.js';

let bootstrapped = false;

export async function bootstrapCms() {
  if (bootstrapped) return;
  await seedDefaultUsers();
  await seedSafariPackages();
  bootstrapped = true;
  logger.info('Safari CMS store ready');
}

export function resetBootstrapFlag() {
  bootstrapped = false;
}
