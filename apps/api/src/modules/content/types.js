import { SafariStatus } from '@gm-safaris/shared-types';
import { emptyBlogDocument, normalizeBlogDocument, emptyDestinationDocument, normalizeDestinationDocument, emptyGroupSafariDocument } from '@gm-safaris/safari-ui';

export const CONTENT_TYPES = Object.freeze({
  pages: {
    key: 'pages',
    label: 'Pages & website content',
    singular: 'page',
    nav: 'pages',
    createTitle: 'New page',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'slug', label: 'Slug', type: 'text', hint: 'Used on the public URL' },
      { name: 'kicker', label: 'Kicker', type: 'text' },
      { name: 'hero_image', label: 'Hero photo', type: 'image' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { name: 'body', label: 'Body', type: 'textarea' },
      { name: 'seo_title', label: 'SEO title (shown in Google, max 60 characters)', type: 'text' },
      { name: 'seo_description', label: 'SEO description (max 160 characters)', type: 'textarea' },
      { name: 'seo_keywords', label: 'SEO keywords (comma-separated)', type: 'textarea' },
      { name: 'og_image', label: 'Share image (WhatsApp / Facebook preview)', type: 'image' },
    ],
  },
  destinations: {
    key: 'destinations',
    label: 'Destinations',
    singular: 'destination',
    nav: 'destinations',
    createTitle: 'New destination',
    fields: [
      { name: 'title', label: 'Name', type: 'text' },
      { name: 'slug', label: 'Slug', type: 'text' },
      { name: 'region', label: 'Region', type: 'text' },
      { name: 'country', label: 'Country', type: 'text' },
      { name: 'kicker', label: 'Kicker', type: 'text' },
      { name: 'tagline', label: 'Tagline', type: 'textarea' },
      { name: 'blurb', label: 'Short blurb', type: 'textarea' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'cta', label: 'Button label', type: 'text' },
      { name: 'image', label: 'Cover photo', type: 'image' },
      { name: 'image_alt', label: 'Cover alt text', type: 'text' },
      { name: 'gallery', label: 'Gallery photos', type: 'gallery' },
      { name: 'lat', label: 'Latitude', type: 'text' },
      { name: 'lng', label: 'Longitude', type: 'text' },
      { name: 'climate', label: 'Climate (Title — body, one per line)', type: 'textarea' },
      { name: 'getting_there', label: 'How to get there', type: 'textarea' },
      { name: 'airstrips', label: 'Airstrips and transfers (one per line)', type: 'textarea' },
      { name: 'entry_fees', label: 'Park fees and rules', type: 'textarea' },
      { name: 'paragraphs', label: 'Page copy (one paragraph per line)', type: 'textarea' },
      { name: 'highlights', label: 'Highlights (Title — body, one per line)', type: 'textarea' },
      { name: 'facts', label: 'Quick facts (Label | Value, one per line)', type: 'textarea' },
      { name: 'seasons', label: 'Best time to visit (Title — body, one per line)', type: 'textarea' },
      { name: 'wildlife', label: 'Wildlife (one per line)', type: 'textarea' },
      { name: 'activities', label: 'Activities (Title — body, one per line)', type: 'textarea' },
      { name: 'attractions', label: 'Attractions (one per line)', type: 'textarea' },
      { name: 'faqs', label: 'FAQs (Question | Answer, one per line)', type: 'textarea' },
      { name: 'seo_title', label: 'SEO title', type: 'text' },
      { name: 'seo_description', label: 'SEO description', type: 'textarea' },
      { name: 'seo_keywords', label: 'Keywords', type: 'text' },
      { name: 'canonical_url', label: 'Canonical URL', type: 'text' },
      { name: 'og_image', label: 'Open Graph image', type: 'image' },
    ],
  },
  posts: {
    key: 'posts',
    label: 'Blog',
    singular: 'article',
    nav: 'blog',
    createTitle: 'New article',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'slug', label: 'Slug', type: 'text' },
      { name: 'topic', label: 'Category', type: 'text', hint: 'climbing, safari, about-us, about-tanzania, islands, wildlife, itineraries' },
      { name: 'date', label: 'Publish date', type: 'text' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { name: 'author', label: 'Author', type: 'text' },
      { name: 'image', label: 'Cover photo', type: 'image' },
      { name: 'seo_title', label: 'SEO title', type: 'text' },
      { name: 'seo_description', label: 'SEO description', type: 'textarea' },
      { name: 'seo_keywords', label: 'Keywords', type: 'text' },
      { name: 'canonical_url', label: 'Canonical URL', type: 'text' },
      { name: 'og_image', label: 'Open Graph image', type: 'image' },
    ],
  },
  testimonials: {
    key: 'testimonials',
    label: 'Testimonials & reviews',
    singular: 'review',
    nav: 'reviews',
    createTitle: 'New review',
    fields: [
      { name: 'title', label: 'Guest name', type: 'text' },
      { name: 'detail', label: 'Country or trip (e.g. "United Kingdom · 7-day safari")', type: 'text' },
      { name: 'quote', label: 'What they said', type: 'textarea' },
      { name: 'image', label: 'Guest photo', type: 'image' },
    ],
  },
  faqs: {
    key: 'faqs',
    label: 'FAQs',
    singular: 'FAQ',
    nav: 'faqs',
    createTitle: 'New FAQ',
    fields: [
      { name: 'title', label: 'Question', type: 'text' },
      { name: 'group', label: 'Group', type: 'text', hint: 'safaris, join-safari, kilimanjaro, contact' },
      { name: 'answer', label: 'Answer', type: 'textarea' },
    ],
  },
  lodges: {
    key: 'lodges',
    label: 'Accommodations',
    singular: 'accommodation',
    nav: 'lodges',
    createTitle: 'New accommodation',
    fields: [
      { name: 'title', label: 'Name', type: 'text' },
      { name: 'place', label: 'Place', type: 'text' },
      { name: 'region', label: 'Region', type: 'text', hint: 'Arusha, Tarangire, Lake Manyara, Serengeti, Ngorongoro / Karatu' },
      { name: 'website', label: 'Property website', type: 'text' },
      { name: 'blurb', label: 'Blurb', type: 'textarea' },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        options: [
          { value: 'midrange', label: 'Mid-range' },
          { value: 'luxury', label: 'Luxury' },
          { value: 'premium-luxury', label: 'Premium Luxury' },
        ],
        hint: 'Required. Used to filter lodges on the website and in this list.',
      },
      { name: 'image', label: 'Cover photo', type: 'image' },
      { name: 'gallery', label: 'Extra photos', type: 'gallery' },
    ],
  },
  departures: {
    key: 'departures',
    label: 'Group Safari',
    singular: 'group safari',
    nav: 'departures',
    createTitle: 'New group safari',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'slug', label: 'Slug', type: 'text' },
      { name: 'dates', label: 'Dates label', type: 'text' },
      { name: 'start', label: 'Start date (YYYY-MM-DD)', type: 'text' },
      { name: 'end', label: 'End date (YYYY-MM-DD)', type: 'text' },
      { name: 'duration', label: 'Duration (days)', type: 'text' },
      { name: 'duration_label', label: 'Duration label', type: 'text' },
      { name: 'spaces', label: 'Spaces label', type: 'text' },
      { name: 'price_from', label: 'Price per person', type: 'text' },
      { name: 'currency', label: 'Currency', type: 'text' },
      { name: 'destination', label: 'Places', type: 'text' },
      { name: 'short_description', label: 'Short description', type: 'textarea' },
      { name: 'overview', label: 'Overview', type: 'textarea' },
      { name: 'description', label: 'Full description', type: 'textarea' },
      { name: 'highlights', label: 'Highlights', type: 'textarea' },
      { name: 'inclusions', label: 'Inclusions', type: 'textarea' },
      { name: 'exclusions', label: 'Exclusions', type: 'textarea' },
      { name: 'itinerary', label: 'Itinerary', type: 'textarea' },
      { name: 'image', label: 'Photo', type: 'image' },
    ],
  },
  menus: {
    key: 'menus',
    label: 'Menus & navigation',
    singular: 'menu',
    nav: 'menus',
    createTitle: 'New menu',
    fields: [
      { name: 'title', label: 'Menu name', type: 'text' },
      { name: 'location', label: 'Location', type: 'text', hint: 'primary, utility, or footer' },
      { name: 'items', label: 'Links (Label | /path/ per line)', type: 'textarea' },
    ],
  },
});

export function emptyDraft(type, extras = {}) {
  if (type === 'posts') {
    return normalizeBlogDocument(emptyBlogDocument(extras));
  }
  if (type === 'destinations') {
    return normalizeDestinationDocument(emptyDestinationDocument(extras));
  }
  if (type === 'departures') {
    return emptyGroupSafariDocument(extras);
  }
  const spec = CONTENT_TYPES[type];
  const draft = { title: extras.title || `New ${spec?.singular || 'item'}` };
  for (const field of spec?.fields || []) {
    if (draft[field.name] == null) draft[field.name] = '';
  }
  return { ...draft, ...extras };
}

export function displayTitle(record) {
  return record?.draft?.title || record?.published?.title || record?.slug || 'Untitled';
}

export { SafariStatus as ContentStatus };
