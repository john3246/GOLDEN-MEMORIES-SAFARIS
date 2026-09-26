import { connectDatabase } from '../apps/api/src/database/index.js';
import { initCmsStore, readStore } from '../apps/api/src/cms-store/index.js';
import { gmsTrips } from '../apps/website-com/src/pages/tours/gms-trips.js';
import { kilimanjaroTreks } from '../apps/website-com/src/pages/kilimanjaro/packages.js';

async function main() {
  const pool = await connectDatabase().catch((err) => {
    console.error('Database connection failed:', err);
    return null;
  });
  await initCmsStore({ pool });

  const store = await readStore();
  const cmsSafaris = store.safaris || [];
  console.log('CMS Safaris count:', cmsSafaris.length);
  console.log('Client gmsTrips count:', gmsTrips.length);
  console.log('Client kilimanjaroTreks count:', kilimanjaroTreks.length);

  const cmsSlugs = new Set(cmsSafaris.map(s => s.slug || s.draft?.slug || s.published?.slug));
  console.log('\n--- Client trips NOT in CMS by slug ---');
  let missingCount = 0;
  for (const trip of [...gmsTrips, ...kilimanjaroTreks]) {
    if (!cmsSlugs.has(trip.slug) && !cmsSlugs.has(trip.id)) {
      console.log('MISSING IN CMS:', trip.slug || trip.id, '->', trip.title);
      missingCount++;
    }
  }
  console.log(`Total missing in CMS: ${missingCount}`);

  console.log('\n--- CMS trips summary ---');
  for (const s of cmsSafaris) {
    const doc = s.published || s.draft || {};
    const itin = doc.itinerary || [];
    const missingAcc = itin.filter(d => !d.accommodation_name && !d.accommodation && !d.stay);
    const missingImg = itin.filter(d => !d.image && !d.accommodation_image);
    console.log(`[${s.status}] ${s.slug} (${doc.title}): ${itin.length} days, missingAcc=${missingAcc.length}, missingImg=${missingImg.length}, tour_type=${doc.tour_type}`);
  }

  process.exit(0);
}

main().catch(console.error);
