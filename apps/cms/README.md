# GM Safaris CMS

Admin application for Safari package content. Other modules (blog, hotels, pages) are out of scope for this release.

## Run

```bash
# from repo root — API must be running
npm run dev:api
npm run dev:cms
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` to `http://localhost:3000`.

Hosted client preview (after the API Web Service is live and the static site is rebuilt with `VITE_API_BASE_URL`): [https://golden-memories-safaris-2.onrender.com/cms/](https://golden-memories-safaris-2.onrender.com/cms/).

See [docs/cms/safari-cms.md](../../docs/cms/safari-cms.md) for roles, workflow, and default logins.
