import { SafariStatus } from '@gm-safaris/shared-types';
import { updateStore } from '../../cms-store/index.js';
import { createId, slugify } from '@gm-safaris/shared-utils';
import { CONTENT_TYPES, emptyDraft } from './types.js';

const DEFAULT_SETTINGS = {
  websiteLive: true,
  site: {
    name: 'Golden Memories Safaris',
    shortName: 'GM Safaris',
    tagline: 'Every safari with Sparkle of Gold',
    phone: '+255 786 383 273',
    phoneAlt: '+255 754 750 070',
    email: 'info@gmsafaris.co.tz',
    address: 'Njiro, Arusha, Tanzania',
    websiteUrl: 'https://www.gmsafaris.com',
    cmsUrl: '',
    socials: [
      { label: 'Facebook', href: 'https://www.facebook.com/' },
      { label: 'X', href: 'https://x.com/' },
      { label: 'TikTok', href: 'https://www.tiktok.com/' },
    ],
  },
  email: {
    fromName: 'Golden Memories Safaris',
    fromEmail: 'info@gmsafaris.co.tz',
    replyTo: 'info@gmsafaris.co.tz',
    notifyTo: 'info@gmsafaris.co.tz',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpSecure: false,
  },
  seo: {
    defaultTitle: 'Golden Memories Safaris – Tanzania Safaris Experts',
    defaultDescription:
      'Golden Memories Safaris — premier Tanzania wildlife safaris, Kilimanjaro treks, and Zanzibar beach holidays crafted by experts in Arusha.',
  },
};

const PAGES = [
  { title: 'Home', slug: 'home', kicker: 'Golden Memories Safaris', excerpt: 'Karibu Tanzania.', },
  { title: 'About Us', slug: 'about', kicker: 'Our story', excerpt: 'Local Tanzanian safari experts since 2023.' },
  { title: 'Contact', slug: 'contact', kicker: 'Plan your trip', excerpt: 'Call, email, or send a message from Arusha.' },
  { title: 'Accommodations', slug: 'accommodations', kicker: 'Where you stay', excerpt: 'Lodges and camps we book across Tanzania.' },
  { title: 'Reviews', slug: 'reviews', kicker: 'Guest stories', excerpt: 'Rated 5/5 by served clients.' },
  { title: 'Kilimanjaro', slug: 'kilimanjaro', kicker: 'Mountain climbing', excerpt: 'Guided routes from Arusha and Moshi.' },
  { title: 'Group Safari', slug: 'join-safari', kicker: 'Open departures', excerpt: 'Small-group dates you can join.' },
  { title: 'Destinations', slug: 'destinations', kicker: 'Tanzania parks', excerpt: 'Northern Circuit, coast, south, and west.' },
  { title: 'Blog', slug: 'blog', kicker: 'Travel notes', excerpt: 'Practical Tanzania travel articles.' },
];

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

export async function seedSiteContent() {
  const at = new Date().toISOString();
  await updateStore((store) => {
    store.settings = store.settings || { ...DEFAULT_SETTINGS };
    if (!store.pages?.length) {
      store.pages = PAGES.map((page) => publishedRecord('pages', page, at));
    }
    if (!store.menus?.length) {
      store.menus = [
        publishedRecord(
          'menus',
          {
            title: 'Primary',
            location: 'primary',
            items: 'Home | /\nDestinations | /destinations/\nSafaris | /tours/\nGroup Safari | /join-safari/\nKilimanjaro | /kilimanjaro/\nContact Us | /contact/',
          },
          at
        ),
        publishedRecord(
          'menus',
          {
            title: 'Utility',
            location: 'utility',
            items: 'Accommodations | /accommodations/\nBlogs | /blog/\nAbout Us | /about/\nReviews | /reviews/',
          },
          at
        ),
      ];
    }
    store.meta = { ...(store.meta || {}), seededSite: true };
  });
  const { seedWebsiteCatalog } = await import('./site-catalog.seed.js');
  await seedWebsiteCatalog();
}

export { DEFAULT_SETTINGS, CONTENT_TYPES };
