import { SafariStatus } from '@gm-safaris/shared-types';
import { memoryCache } from '../../cache/index.js';
import { config } from '../../config/index.js';

const PREFIX = 'safari:public:';

export const safariCache = {
  listKey(query) {
    return `${PREFIX}list:${JSON.stringify(query)}`;
  },
  slugKey(slug) {
    return `${PREFIX}slug:${slug}`;
  },
  idKey(id) {
    return `${PREFIX}id:${id}`;
  },

  async get(key) {
    return memoryCache.get(key);
  },

  async set(key, value) {
    return memoryCache.set(key, value, config.redis.ttlSeconds);
  },

  async invalidateAll() {
    await memoryCache.invalidatePrefix(PREFIX);
  },
};

export function isPublicStatus(status) {
  return status === SafariStatus.PUBLISHED;
}
