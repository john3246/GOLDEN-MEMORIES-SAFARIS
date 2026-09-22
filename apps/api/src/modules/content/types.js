import { SafariStatus } from '@gm-safaris/shared-types';
import { emptyBlogDocument, normalizeBlogDocument } from '@gm-safaris/safari-ui';

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
      { name: 'seo_title', label: 'SEO title', type: 'text' },
      { name: 'seo_description', label: 'SEO description', type: 'textarea' },
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
      { name: 'blurb', label: 'Short blurb', type: 'textarea' },
      { name: 'image', label: 'Cover photo', type: 'image' },
      { name: 'gallery', label: 'Gallery photos', type: 'gallery' },
      { name: 'paragraphs', label: 'Page copy (one paragraph per line)', type: 'textarea' },
      { name: 'highlights', label: 'Highlights (one per line)', type: 'textarea' },
      { name: 'seo_title', label: 'SEO title', type: 'text' },
      { name: 'seo_description', label: 'SEO description', type: 'textarea' },
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
      { name: 'topic', label: 'Topic', type: 'text', hint: 'climbing, safari, about-us, about-tanzania, islands, wildlife' },
      { name: 'date', label: 'Date', type: 'text' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { name: 'image', label: 'Cover photo', type: 'image' },
      { name: 'paragraphs', label: 'Article body (one paragraph per line)', type: 'textarea' },
      { name: 'seo_title', label: 'SEO title', type: 'text' },
      { name: 'seo_description', label: 'SEO description', type: 'textarea' },
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
      { name: 'detail', label: 'Trip / location', type: 'text' },
      { name: 'quote', label: 'Quote', type: 'textarea' },
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
      { name: 'blurb', label: 'Blurb', type: 'textarea' },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        options: [
          { value: 'midrange', label: 'Mid-range' },
          { value: 'luxury', label: 'Luxury' },
        ],
        hint: 'Required. Used to filter lodges on the website and in this list.',
      },
      { name: 'image', label: 'Cover photo', type: 'image' },
      { name: 'gallery', label: 'Extra photos', type: 'gallery' },
    ],
  },
  departures: {
    key: 'departures',
    label: 'Join Safari departures',
    singular: 'departure',
    nav: 'departures',
    createTitle: 'New departure',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'dates', label: 'Dates label', type: 'text' },
      { name: 'start', label: 'Start date (YYYY-MM-DD)', type: 'text' },
      { name: 'end', label: 'End date (YYYY-MM-DD)', type: 'text' },
      { name: 'duration', label: 'Duration', type: 'text' },
      { name: 'spaces', label: 'Spaces label', type: 'text' },
      { name: 'overview', label: 'Overview', type: 'textarea' },
      { name: 'highlights', label: 'Highlights (one per line)', type: 'textarea' },
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
