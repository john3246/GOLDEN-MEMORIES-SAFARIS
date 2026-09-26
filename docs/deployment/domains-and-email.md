# Domains, HTTPS and email

## Website domain (gmsafaris.com)

The API serves the website, the CMS (`/cms/`) and the API from one service
(e.g. a Render **Web Service** with build `npm install && npm run build:render`
and start `npm start`).

1. In your host, add both custom domains: `www.gmsafaris.com` and `gmsafaris.com`.
2. At your DNS provider:

   | Type | Name | Value |
   |------|------|-------|
   | CNAME | `www` | the host name your provider gives you (e.g. `golden-memories-safaris.onrender.com`) |
   | A / ALIAS | `@` | the IP / ALIAS target your provider gives you for the apex domain |

3. Wait for the certificate to be issued (HTTPS), then set these environment variables:

   ```
   NODE_ENV=production
   SITE_URL_COM=https://www.gmsafaris.com
   CANONICAL_HOST=www.gmsafaris.com
   CORS_ORIGINS_CMS=https://www.gmsafaris.com
   CORS_ORIGINS_WEBSITE=https://www.gmsafaris.com
   ```

   `CANONICAL_HOST` makes `http://…` and `gmsafaris.com` redirect permanently to
   `https://www.gmsafaris.com`, so Google indexes one copy of each page. HSTS is
   switched on automatically in production.

4. In **CMS → Site settings** set *Public website URL* to `https://www.gmsafaris.com`
   (used in sitemap, canonical links, share images and email links).

5. Submit `https://www.gmsafaris.com/sitemap.xml` in
   [Google Search Console](https://search.google.com/search-console) and
   [Bing Webmaster Tools](https://www.bing.com/webmasters).

## Sister site (gmsafaris.co.tz)

The .co.tz site reads published content through the read-only external API.
Issue it a key in **CMS → API keys** and keep `CORS_ORIGINS_EXTERNAL`
set to `https://www.gmsafaris.co.tz,https://gmsafaris.co.tz`. To push changes to
it the moment they are published, add its endpoint in **CMS → Integrations &
webhooks** (events `safari.published`, `content.published`).

## Email that lands in the inbox (not spam)

The site sends from `SMTP_FROM_EMAIL` (e.g. `info@gmsafaris.co.tz`) through
Google Workspace / Gmail SMTP with an **App Password**.

For the sending domain (`gmsafaris.co.tz`, and `gmsafaris.com` if you send from it), add:

| Record | Name | Value |
|--------|------|-------|
| TXT (SPF) | `@` | `v=spf1 include:_spf.google.com ~all` |
| TXT (DKIM) | `google._domainkey` | generate in Google Admin → Apps → Gmail → Authenticate email |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:info@gmsafaris.co.tz; adkim=s; aspf=s` |

Only one SPF record may exist per domain — merge `include:` values if you use
other senders. Start DMARC with `p=none` for two weeks if you are unsure, then
tighten to `quarantine`.

Check the setup:

* **CMS → System status → Check email connection** (logs in to the mail server).
* **CMS → Site settings → Send test email**.
* Send a test to <https://www.mail-tester.com> and aim for 9/10 or better.

## Secrets checklist before going live

* `JWT_SECRET` — random, 48+ characters (CMS sessions).
* `APP_ENCRYPTION_KEY` — random, 32+ characters; never change it afterwards.
* `DATABASE_PASSWORD` — strong, unique.
* `CMS_ADMIN_PASSWORD` — only used when the database has no users; change the
  owner's password in **CMS → My profile** after the first sign-in.
* `SMTP_PASS` — a Google App Password, not the mailbox password.
