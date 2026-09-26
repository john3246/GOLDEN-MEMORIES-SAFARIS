/**
 * Take every blog post off the public website. Posts stay in the CMS as
 * unpublished drafts, so staff can still open, edit and re-publish them one
 * by one (Blog posts → Publish).
 *
 * Usage: npm run cms:unpublish-posts
 */
process.env.DISABLE_JOBS = 'true';
const { connectDatabase, closeDatabase } = await import('../apps/api/src/database/index.js');
const { initCmsStore } = await import('../apps/api/src/cms-store/index.js');
const { contentRepository } = await import('../apps/api/src/modules/content/content.repository.js');
const { SafariStatus } = await import('@gm-safaris/shared-types');
const { contentService } = await import('../apps/api/src/modules/content/content.service.js');

const pool = await connectDatabase();
await initCmsStore({ pool });

const posts = await contentRepository.all('posts');
let changed = 0;
for (const post of posts) {
  if (post.status !== SafariStatus.PUBLISHED) continue;
  await contentService.unpublish('posts', post.id, null);
  changed += 1;
}
console.log(`Unpublished ${changed} of ${posts.length} blog posts. They remain in the CMS as drafts.`);
await closeDatabase();
process.exit(0);
