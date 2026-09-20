/**
 * Postman Collection v2.1 for the sister-site external API.
 * Served at GET /api/v1/docs/postman.json
 */
function url(raw, path, query = []) {
  const parsed = {
    raw,
    host: ['{{baseUrl}}'],
    path,
  };
  if (query.length) parsed.query = query;
  return parsed;
}

function get(name, raw, path, query = []) {
  return {
    name,
    request: {
      method: 'GET',
      header: [{ key: 'Accept', value: 'application/json', type: 'text' }],
      url: url(raw, path, query),
    },
    response: [],
  };
}

export const externalPostmanCollection = {
  info: {
    _postman_id: '8c3e1a7b-4d2f-4b91-9e6a-2f0c5d8a1b44',
    name: 'GM Safaris External API',
    description:
      'Read-only published content for the sister site. Set the collection variable apiKey from CMS > API and integrations.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  auth: {
    type: 'apikey',
    apikey: [
      { key: 'value', value: '{{apiKey}}', type: 'string' },
      { key: 'key', value: 'X-Api-Key', type: 'string' },
      { key: 'in', value: 'header', type: 'string' },
    ],
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:3000/api/v1/external' },
    { key: 'apiKey', value: '' },
    { key: 'tourSlug', value: 'classic-tanzania-lodge-safari' },
    { key: 'destinationSlug', value: 'serengeti' },
    { key: 'blogSlug', value: '' },
  ],
  item: [
    {
      name: '01 Catalog and status',
      item: [
        get('Status', '{{baseUrl}}/status', ['status']),
        get('Catalog', '{{baseUrl}}/catalog', ['catalog']),
        {
          name: 'No key should be 401',
          request: {
            auth: { type: 'noauth' },
            method: 'GET',
            header: [{ key: 'Accept', value: 'application/json', type: 'text' }],
            url: url('{{baseUrl}}/catalog', ['catalog']),
          },
          response: [],
        },
      ],
    },
    {
      name: '02 Tours and safaris',
      item: [
        get('List tours', '{{baseUrl}}/tours?limit=100', ['tours'], [{ key: 'limit', value: '100' }]),
        get('One tour by slug', '{{baseUrl}}/tours/{{tourSlug}}', ['tours', '{{tourSlug}}']),
        get('List safaris', '{{baseUrl}}/safaris?limit=100', ['safaris'], [{ key: 'limit', value: '100' }]),
      ],
    },
    {
      name: '03 Destinations blogs joining safaris',
      item: [
        get('Destinations', '{{baseUrl}}/destinations', ['destinations']),
        get('One destination by slug', '{{baseUrl}}/destinations/slug/{{destinationSlug}}', [
          'destinations',
          'slug',
          '{{destinationSlug}}',
        ]),
        get('Blogs', '{{baseUrl}}/blogs', ['blogs']),
        get('One blog by slug', '{{baseUrl}}/blogs/slug/{{blogSlug}}', ['blogs', 'slug', '{{blogSlug}}']),
        get('Joining safaris', '{{baseUrl}}/join-safaris', ['join-safaris']),
      ],
    },
    {
      name: '04 Rest of the public site',
      item: [
        get('Pages', '{{baseUrl}}/pages', ['pages']),
        get('Menus', '{{baseUrl}}/menus', ['menus']),
        get('FAQs', '{{baseUrl}}/faqs', ['faqs']),
        get('Lodges', '{{baseUrl}}/lodges', ['lodges']),
        get('Testimonials', '{{baseUrl}}/testimonials', ['testimonials']),
        get('Public settings', '{{baseUrl}}/settings', ['settings']),
      ],
    },
  ],
};
