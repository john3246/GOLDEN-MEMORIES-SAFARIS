import { SafariStatus } from '@gm-safaris/shared-types';
import { updateStore } from '../../cms-store/index.js';
import { createId, slugify } from '@gm-safaris/shared-utils';
import { emptyDraft } from './types.js';

function publishedRecord(type, draft, at) {
  const slug = slugify(draft.slug || draft.title);
  const doc = emptyDraft(type, { ...draft, slug });
  return {
    id: createId(),
    type,
    slug,
    status: SafariStatus.PUBLISHED,
    draft: doc,
    published: { ...doc },
    created_by: 'seed',
    updated_by: 'seed',
    created_at: at,
    updated_at: at,
    published_at: at,
  };
}

function hasItem(list, record) {
  const slug = record.slug;
  const title = String(record.draft?.title || '').toLowerCase();
  return (list || []).some((item) => {
    if (item.slug && slug && item.slug === slug) return true;
    const existingTitle = String(item.draft?.title || item.published?.title || '').toLowerCase();
    return title && existingTitle === title;
  });
}

function mergeMissing(store, type, incoming) {
  const existing = store[type] || [];
  const extra = incoming.filter((record) => !hasItem(existing, record));
  store[type] = extra.length ? [...existing, ...extra] : existing;
}

function upsertPublished(store, type, incoming) {
  const existing = store[type] || [];
  const next = [...existing];
  for (const record of incoming) {
    const index = next.findIndex((item) => {
      if (item.slug && record.slug && item.slug === record.slug) return true;
      const existingTitle = String(item.draft?.title || item.published?.title || '').toLowerCase();
      const title = String(record.draft?.title || '').toLowerCase();
      return Boolean(title && existingTitle === title);
    });
    if (index === -1) {
      next.push(record);
      continue;
    }
    const prev = next[index];
    const doc = { ...(prev.draft || {}), ...record.draft };
    next[index] = {
      ...prev,
      slug: record.slug || prev.slug,
      status: SafariStatus.PUBLISHED,
      draft: doc,
      published: { ...doc },
      updated_at: record.updated_at,
      published_at: record.published_at,
      updated_by: record.updated_by || prev.updated_by,
    };
  }
  store[type] = next;
}

function lines(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item?.title && item?.body) return `${item.title} — ${item.body}`;
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
  return String(value || '');
}

async function loadWebsiteCatalog() {
  const [
    destinationsMod,
    blogMod,
    lodgesMod,
    joinMod,
    toursMod,
    kiliMod,
    reviewsMod,
  ] = await Promise.all([
    import('../../../../website-com/src/pages/destinations/catalog.js'),
    import('../../../../website-com/src/pages/blog/content.js'),
    import('../../../../website-com/src/pages/accommodations/content.js'),
    import('../../../../website-com/src/pages/join-safari/content.js'),
    import('../../../../website-com/src/pages/tours/content.js'),
    import('../../../../website-com/src/pages/kilimanjaro/content.js'),
    import('../../../../website-com/src/pages/reviews/content.js'),
  ]);
  return {
    destinations: destinationsMod.destinationPlaces || [],
    posts: blogMod.blogArticles || [],
    lodges: lodgesMod.lodges || [],
    departures: [...(joinMod.joiningSafaris || []), ...(joinMod.openJoiningPackages || [])],
    faqs: [
      ...(toursMod.safariFaqs || []).map((item) => ({ ...item, group: 'safaris' })),
      ...(kiliMod.kiliFaqs || []).map((item) => ({ ...item, group: 'kilimanjaro' })),
      ...(joinMod.joinFaqs || []).map((item) => ({ ...item, group: 'join-safari' })),
    ],
    testimonials: reviewsMod.reviewList || [],
  };
}

/**
 * Copy published website catalogs into CMS collections so staff can
 * edit every public page the same way as safari packages.
 */
export async function seedWebsiteCatalog() {
  const at = new Date().toISOString();
  let catalog;
  try {
    catalog = await loadWebsiteCatalog();
  } catch (err) {
    console.error('Unable to seed website catalog into CMS', err);
    return;
  }

  await updateStore((store) => {
    mergeMissing(
      store,
      'destinations',
      catalog.destinations.map((place) =>
        publishedRecord(
          'destinations',
          {
            title: place.name,
            slug: place.slug,
            region: place.region || '',
            blurb: place.tagline || place.blurb || '',
            image: place.image || '',
            paragraphs: lines(place.paragraphs),
            highlights: lines(place.highlights),
            seo_title: place.name,
            seo_description: place.tagline || '',
          },
          at
        )
      )
    );
    mergeMissing(
      store,
      'posts',
      catalog.posts.map((post) =>
        publishedRecord(
          'posts',
          {
            title: post.title,
            slug: post.slug,
            topic: post.topic || 'safari',
            date: post.date || '',
            excerpt: post.excerpt || '',
            image: post.image || '',
            paragraphs: lines(post.paragraphs),
            blocks: Array.isArray(post.blocks) ? post.blocks : [],
            seo_title: post.title,
            seo_description: post.excerpt || '',
          },
          at
        )
      )
    );
    upsertPublished(
      store,
      'lodges',
      catalog.lodges.map((lodge) =>
        publishedRecord(
          'lodges',
          {
            title: lodge.name,
            place: lodge.place || '',
            blurb: lodge.blurb || '',
            category: lodge.category === 'luxury' ? 'luxury' : 'midrange',
            image: lodge.image || '',
            gallery: lodge.gallery || [],
          },
          at
        )
      )
    );
    mergeMissing(
      store,
      'faqs',
      catalog.faqs.map((item) =>
        publishedRecord(
          'faqs',
          {
            title: item.q,
            group: item.group || 'safaris',
            answer: item.a || '',
          },
          at
        )
      )
    );
    mergeMissing(
      store,
      'testimonials',
      catalog.testimonials.map((item) =>
        publishedRecord(
          'testimonials',
          {
            title: item.name,
            detail: item.detail || '',
            quote: item.quote || '',
          },
          at
        )
      )
    );
    mergeMissing(
      store,
      'departures',
      catalog.departures.map((trip) =>
        publishedRecord(
          'departures',
          {
            title: trip.title,
            slug: trip.id,
            dates: trip.datesLabel || '',
            start: trip.start || '',
            end: trip.end || '',
            duration: trip.duration || '',
            spaces: trip.spaces || '',
            overview: trip.overview || '',
            highlights: lines(trip.highlights),
            image: trip.image || '',
            price_from: trip.price_from || '',
          },
          at
        )
      )
    );
  });
}
