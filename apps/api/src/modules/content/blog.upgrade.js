import { emptyDraft } from './types.js';
import { contentRepository } from './content.repository.js';
import { syncBlogPost } from './blog.sync.js';
import { logger } from '../../logging/index.js';

export async function upgradeBlogDocuments() {
  const items = await contentRepository.all('posts');
  for (const record of items) {
    record.draft = emptyDraft('posts', record.draft || {});
    if (record.published) record.published = emptyDraft('posts', record.published);
    await contentRepository.save('posts', record);
    await syncBlogPost(record);
  }
  if (items.length) {
    logger.info('Blog documents upgraded and synced', { count: items.length });
  }
}
