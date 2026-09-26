import { slugify } from '../tours/paths.js';
import { openJoiningPackages } from './packages.js';
import { joiningSafaris } from './content.js';

function asPackage(item) {
  const slug = item.slug || item.id || slugify(item.title);
  const days = Array.isArray(item.itinerary) && item.itinerary.length ? item.itinerary : item.days || [];
  return {
    ...item,
    slug,
    id: item.id || slug,
    activity: item.activity || 'Group Safari',
    included: item.included || item.inclusions || [],
    excluded: item.excluded || item.exclusions || [],
    itinerary: days.map((day) => ({
      day: day.day,
      title: day.title,
      body: day.body || day.description || '',
      stay: day.stay || day.accommodation || '',
      meals: day.meals,
      viewing: day.viewing,
      transport: day.transport,
      image: typeof day.image === 'string' ? day.image : day.image?.url,
    })),
  };
}

export function allJoinPackages() {
  const seen = new Set();
  return [...openJoiningPackages, ...joiningSafaris].map(asPackage).filter((pkg) => {
    if (seen.has(pkg.slug)) return false;
    seen.add(pkg.slug);
    return true;
  });
}

export function getJoinPackageBySlug(slug) {
  return allJoinPackages().find((pkg) => pkg.slug === slug || pkg.id === slug || pkg.cmsSlug === slug) || null;
}

export function relatedJoinPackages(pkg, count = 4) {
  return allJoinPackages()
    .filter((item) => item.slug !== pkg.slug)
    .slice(0, count);
}

export function allJoinSlugs() {
  return allJoinPackages().map((pkg) => pkg.slug);
}

export function isJoinPackage(tour) {
  if (!tour) return false;
  const slug = tour.slug || tour.id;
  return allJoinPackages().some((pkg) => pkg.slug === slug || pkg.id === slug);
}
