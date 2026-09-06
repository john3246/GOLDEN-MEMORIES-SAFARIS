# GM Safaris — gmsafaris.com

Customer-facing website for the primary brand domain.

## Status

Home landing page is implemented (content from gmsafaris.com, layout rhythm from zaratours.com).

Remaining page routes (`tours`, `destinations`, `about`, `contact`, `blog`) are still placeholders until later phases.

## Run locally

```bash
# from monorepo root (after npm install)
npm run dev -w @gm-safaris/website-com

# or from this package
npm run dev
```

Dev server: `http://localhost:4173`

## Architecture rules

- Consume content through the **central API** when domain modules ship (today: static content module).
- Independent of `gmsafaris.co.tz`.
- Lightweight: semantic HTML, ES modules, Tailwind CSS, Vite.

## Structure

```
src/
  pages/home/          Home landing composition + content
  components/          Header, footer, cards
  styles/              Tokens, Tailwind, motion
  main.js              App bootstrap
```
