/**
 * Serve the built website (apps/website-com/dist) and the CMS (/cms/) from
 * the API, with per-page SEO tags, sitemap.xml, robots.txt and sensible
 * caching:
 *   /assets/*  (fingerprinted JS/CSS)  → cached 1 year, immutable
 *   /images/*, /videos/*               → cached 30 days
 *   HTML pages                          → always revalidated (CMS edits show at once)
 */
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import express from 'express';
import { readStore } from '../../cms-store/index.js';
import { metaForPath, injectSeo, buildSitemap, buildRobots } from '../seo/index.js';
import { logger } from '../../logging/index.js';

const htmlCache = new Map();

async function readHtml(file) {
  const stat = await fs.stat(file);
  const hit = htmlCache.get(file);
  if (hit && hit.mtime === stat.mtimeMs) return hit.html;
  const html = await fs.readFile(file, 'utf8');
  htmlCache.set(file, { html, mtime: stat.mtimeMs });
  return html;
}

function htmlFileFor(publicDir, pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const direct = path.join(publicDir, clean, 'index.html');
  if (!path.relative(publicDir, direct).startsWith('..') && fsSync.existsSync(direct)) return direct;
  const parts = clean.split('/').filter(Boolean);
  if (parts.length === 2 && ['tours', 'destinations', 'blog', 'join-safari'].includes(parts[0])) {
    const section = path.join(publicDir, parts[0], 'index.html');
    if (fsSync.existsSync(section)) return section;
  }
  return null;
}

export function servePublicSite(app, publicDir) {
  const cmsIndex = path.join(publicDir, 'cms', 'index.html');

  app.get('/robots.txt', async (_req, res, next) => {
    try {
      res.type('text/plain').setHeader('Cache-Control', 'public, max-age=3600');
      res.send(await buildRobots());
    } catch (err) {
      next(err);
    }
  });

  app.get('/sitemap.xml', async (_req, res, next) => {
    try {
      res.type('application/xml').setHeader('Cache-Control', 'public, max-age=3600');
      res.send(await buildSitemap());
    } catch (err) {
      next(err);
    }
  });

  // Redirects: /cms → /cms/ and section pages without trailing slash.
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const pathname = req.path;
    if (pathname === '/cms' || pathname === '/tours/cms' || pathname === '/tours/cms/') {
      res.redirect(301, '/cms/');
      return;
    }
    if (!pathname.endsWith('/') && !path.extname(pathname) && !pathname.startsWith('/api/') && pathname !== '/health') {
      const query = req.originalUrl.slice(req.path.length);
      res.redirect(301, `${pathname}/${query}`);
      return;
    }
    next();
  });

  app.use(
    '/assets',
    express.static(path.join(publicDir, 'assets'), { immutable: true, maxAge: '365d', index: false, fallthrough: true })
  );
  app.use(
    ['/images', '/videos'],
    express.static(publicDir, { maxAge: '30d', index: false, fallthrough: true })
  );

  app.use('/cms', (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (path.extname(req.path)) return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.sendFile(cmsIndex, (err) => {
      if (err) next(err);
    });
  });

  // HTML pages with SEO injection.
  app.use(async (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api/') || req.path.startsWith('/cms/') || path.extname(req.path)) return next();
    try {
      const file = htmlFileFor(publicDir, req.path);
      const store = await readStore();
      const settings = store.settings || {};
      let metaFailed = false;
      let meta = await metaForPath(req.path).catch((err) => {
        metaFailed = true;
        logger.warn('SEO meta failed', { path: req.path, message: err.message });
        return null;
      });
      let target = file;
      let status = 200;
      // A bug in SEO generation must never turn a real page into a 404.
      if (file && metaFailed) {
        res.setHeader('Cache-Control', 'no-cache');
        res.type('html').send(await readHtml(file));
        return;
      }
      if (!file || (!meta && req.path.split('/').filter(Boolean).length >= 2)) {
        status = 404;
        target = path.join(publicDir, 'index.html');
        meta = {
          title: 'Page not found | Golden Memories Safaris',
          description: 'The page you were looking for has moved or no longer exists. Browse our Tanzania safaris, Kilimanjaro climbs and destinations.',
          keywords: '',
          canonical: '',
          robots: 'noindex,follow',
          type: 'website',
          image: '',
          jsonLd: [],
          heading: 'Page not found',
          summary: 'The page you were looking for has moved or no longer exists.',
          links: [
            { href: '/', label: 'Home' },
            { href: '/tours/', label: 'Safari packages' },
            { href: '/contact/', label: 'Contact us' },
          ],
        };
      }
      if (!fsSync.existsSync(target)) return next();
      const html = injectSeo(await readHtml(target), meta, settings);
      res.status(status);
      res.setHeader('Cache-Control', 'no-cache');
      res.type('html').send(html);
    } catch (err) {
      next(err);
    }
  });

  app.use(express.static(publicDir, { maxAge: '1d', index: false, fallthrough: true }));
}
