import { seedDefaultUsers } from '../modules/users/index.js';
import { seedSafariPackages } from '../modules/safaris/index.js';
import { unpublishPricelessSafaris, syncAllSafaris, fillEmptyItineraries } from '../modules/safaris/safari.maintenance.js';
import { seedSiteContent, upgradeBlogDocuments } from '../modules/content/index.js';
import { logger } from '../logging/index.js';

let bootstrapped = false;


export async function bootstrapCms() {
  if (bootstrapped) return;
  await seedDefaultUsers();
  await seedSafariPackages();
  await unpublishPricelessSafaris();
  await fillEmptyItineraries();
  await syncAllSafaris();
  await seedSiteContent();
  await upgradeBlogDocuments();
  bootstrapped = true;
  logger.info('Safari CMS store ready');
}

export function resetBootstrapFlag() {
  bootstrapped = false;
}
