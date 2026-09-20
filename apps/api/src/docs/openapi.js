/**
 * OpenAPI 3 document for the Safari CMS APIs.
 * Served from GET /api/v1/docs and GET /api/v1/docs/openapi.json
 */
export const safariOpenApi = {
  openapi: '3.0.3',
  info: {
    title: 'GM Safaris Safari API',
    version: '1.0.0',
    description:
      'Public published Safari packages, admin CMS mutations, and third-party read access. Rate limits: public 100/min, admin 200/min, external 120/min, auth 20/15min (configurable).',
  },
  servers: [{ url: '/api/v1', description: 'Version 1' }],
  tags: [
    { name: 'Public', description: 'Published Safari packages for the website' },
    { name: 'Admin', description: 'Authenticated CMS operators' },
    { name: 'External', description: 'Third-party API keys (safaris:read)' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      apiKey: { type: 'apiKey', in: 'header', name: 'X-Api-Key' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'RESOURCE_NOT_FOUND' },
              message: { type: 'string' },
              requestId: { type: 'string' },
            },
          },
        },
      },
      Safari: { type: 'object', description: 'Published Safari package DTO' },
      CollectionMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 8 },
        },
      },
    },
  },
  paths: {
    '/safaris': {
      get: {
        tags: ['Public'],
        summary: 'List published Safari packages',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'destination', in: 'query', schema: { type: 'string' } },
          { name: 'featured', in: 'query', schema: { type: 'boolean' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['display_order', 'newest'] } },
        ],
        responses: {
          200: { description: 'Published packages' },
        },
      },
    },
    '/safaris/slug/{slug}': {
      get: {
        tags: ['Public'],
        summary: 'Get a published Safari by slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Safari package' },
          404: { description: 'Not published or unknown' },
        },
      },
    },
    '/safaris/{id}': {
      get: {
        tags: ['Public'],
        summary: 'Get a published Safari by id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Safari package' }, 404: { description: 'Not found' } },
      },
    },
    '/admin/auth/login': {
      post: {
        tags: ['Admin'],
        summary: 'CMS login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: { email: { type: 'string' }, password: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'JWT + user' }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/admin/safaris': {
      get: {
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        summary: 'List Safari packages (all statuses)',
        responses: { 200: { description: 'Admin list' }, 401: { description: 'Unauthorized' } },
      },
      post: {
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        summary: 'Create a Safari draft',
        responses: { 201: { description: 'Created' }, 403: { description: 'Forbidden' } },
      },
    },
    '/admin/safaris/{id}': {
      get: { tags: ['Admin'], security: [{ bearerAuth: [] }], summary: 'Get Safari including draft', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Admin Safari' } } },
      patch: { tags: ['Admin'], security: [{ bearerAuth: [] }], summary: 'Update draft fields', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated draft' } } },
      put: { tags: ['Admin'], security: [{ bearerAuth: [] }], summary: 'Update draft fields', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated draft' } } },
      delete: { tags: ['Admin'], security: [{ bearerAuth: [] }], summary: 'Delete (Admin only)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' }, 403: { description: 'Editor cannot delete' } } },
    },
    '/admin/safaris/{id}/preview': {
      get: { tags: ['Admin'], security: [{ bearerAuth: [] }], summary: 'Draft preview payload (not public)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Draft document' } } },
    },
    '/admin/safaris/{id}/publish': {
      post: { tags: ['Admin'], security: [{ bearerAuth: [] }], summary: 'Copy draft to published snapshot', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Published' } } },
    },
    '/admin/safaris/{id}/unpublish': {
      post: { tags: ['Admin'], security: [{ bearerAuth: [] }], summary: 'Hide from public API', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Unpublished' } } },
    },
    '/admin/safaris/{id}/duplicate': {
      post: { tags: ['Admin'], security: [{ bearerAuth: [] }], summary: 'Duplicate as a new draft', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 201: { description: 'Copy created' } } },
    },
    '/external/catalog': {
      get: {
        tags: ['External'],
        security: [{ apiKey: [] }],
        summary: 'Counts and paths for every published collection the sister site can consume',
        responses: { 200: { description: 'Catalog' }, 401: { description: 'Invalid key' } },
      },
    },
    '/external/safaris': {
      get: {
        tags: ['External'],
        security: [{ apiKey: [] }],
        summary: 'Published safari packages (same payload as /tours)',
        responses: { 200: { description: 'Published packages' }, 401: { description: 'Invalid key' } },
      },
    },
    '/external/safaris/slug/{slug}': {
      get: {
        tags: ['External'],
        security: [{ apiKey: [] }],
        summary: 'Third-party Safari by slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Safari' }, 404: { description: 'Not published' } },
      },
    },
    '/external/tours': {
      get: {
        tags: ['External'],
        security: [{ apiKey: [] }],
        summary: 'Published tours (alias of /safaris)',
        responses: { 200: { description: 'Published tours' } },
      },
    },
    '/external/destinations': {
      get: { tags: ['External'], security: [{ apiKey: [] }], summary: 'Published destinations', responses: { 200: { description: 'Destinations' } } },
    },
    '/external/blogs': {
      get: { tags: ['External'], security: [{ apiKey: [] }], summary: 'Published blog articles', responses: { 200: { description: 'Posts' } } },
    },
    '/external/join-safaris': {
      get: { tags: ['External'], security: [{ apiKey: [] }], summary: 'Published joining-safari departures', responses: { 200: { description: 'Departures' } } },
    },
    '/external/pages': {
      get: { tags: ['External'], security: [{ apiKey: [] }], summary: 'Published website pages', responses: { 200: { description: 'Pages' } } },
    },
    '/external/menus': {
      get: { tags: ['External'], security: [{ apiKey: [] }], summary: 'Published navigation menus', responses: { 200: { description: 'Menus' } } },
    },
    '/external/faqs': {
      get: { tags: ['External'], security: [{ apiKey: [] }], summary: 'Published FAQs', responses: { 200: { description: 'FAQs' } } },
    },
    '/external/lodges': {
      get: { tags: ['External'], security: [{ apiKey: [] }], summary: 'Published lodges', responses: { 200: { description: 'Lodges' } } },
    },
    '/external/testimonials': {
      get: { tags: ['External'], security: [{ apiKey: [] }], summary: 'Published reviews', responses: { 200: { description: 'Testimonials' } } },
    },
    '/external/settings': {
      get: { tags: ['External'], security: [{ apiKey: [] }], summary: 'Public site settings (no SMTP secrets)', responses: { 200: { description: 'Settings' } } },
    },
  },
};
