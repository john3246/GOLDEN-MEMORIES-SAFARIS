import { describe, it, expect } from 'vitest';
import {
  PublishStatus,
  PUBLIC_PUBLISH_STATUSES,
  ExternalPermission,
} from '@gm-safaris/shared-types';
import { parsePagination, validateSlug, validatePublishStatus } from '@gm-safaris/shared-validation';
import { createRequestId, pick, omit } from '@gm-safaris/shared-utils';
import { loadConfig } from '@gm-safaris/shared-config';

describe('shared-types', () => {
  it('exposes publish statuses and public subset', () => {
    expect(PublishStatus.PUBLISHED).toBe('PUBLISHED');
    expect(PUBLIC_PUBLISH_STATUSES).toContain(PublishStatus.PUBLISHED);
    expect(PUBLIC_PUBLISH_STATUSES).not.toContain(PublishStatus.DRAFT);
  });

  it('lists read-only external permissions', () => {
    expect(ExternalPermission.TOURS_READ).toBe('content:tours:read');
  });
});

describe('shared-validation', () => {
  it('parses pagination with defaults and caps', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 20, offset: 0 });
    expect(parsePagination({ page: '2', limit: '50' }).offset).toBe(50);
    expect(parsePagination({ limit: '999' }).limit).toBe(100);
  });

  it('validates slugs', () => {
    expect(validateSlug('serengeti-safari').ok).toBe(true);
    expect(validateSlug('Bad Slug').ok).toBe(false);
  });

  it('validates publish status', () => {
    expect(validatePublishStatus('DRAFT').ok).toBe(true);
    expect(validatePublishStatus('live').ok).toBe(false);
  });
});

describe('shared-utils', () => {
  it('creates request ids', () => {
    expect(createRequestId()).toMatch(/^req_/);
  });

  it('picks and omits keys', () => {
    const source = { a: 1, b: 2, secret: 'x' };
    expect(pick(source, ['a'])).toEqual({ a: 1 });
    expect(omit(source, ['secret'])).toEqual({ a: 1, b: 2 });
  });
});

describe('shared-config', () => {
  it('loads development defaults', () => {
    const cfg = loadConfig({ NODE_ENV: 'development' });
    expect(cfg.port).toBe(3000);
    expect(cfg.database.name).toBe('gm_safaris');
    expect(cfg.redis.keyPrefix).toBe('gm:safaris:');
  });
});
