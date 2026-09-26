# Run Golden Memories Safaris on your computer (Windows)

Everything — website, CMS and API — runs on your own machine and saves to your
local PostgreSQL database.

## 1. One-time setup

Open **PowerShell** in `D:\GOLDEN MEMORIES SAFARIS` and run:

```powershell
npm install
```

### Database

You already have PostgreSQL installed. The database settings are in `.env`
(`DATABASE_HOST`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`).

* **If the database and user already exist** (you ran the old `npm run db:migrate` before): nothing to do — the API applies the new migrations itself when it starts.
* **If not**, create them with your PostgreSQL superuser password (the one you chose when installing PostgreSQL):

```powershell
$env:PGADMIN_PASSWORD="your-postgres-password"; npm run db:setup
```

`db:setup` creates the `gm_safaris` database and user from `.env`, then applies every migration. You no longer need `psql` on your PATH.

On the first start, all existing CMS content in `apps/api/data/cms/store.json`
(tours, destinations, 90 blog posts, lodges, pages, FAQs, bookings, users,
photos …) is **copied into PostgreSQL automatically**. The JSON file is kept
as a backup and is no longer written to.

## 2. Test it exactly like the live site (recommended)

```powershell
npm run local
```

This builds the website and CMS, then serves everything from one address:

| What | Address |
|------|---------|
| Website | http://localhost:3000 |
| CMS | http://localhost:3000/cms/ |
| API docs | http://localhost:3000/api/v1/docs |
| Sitemap | http://localhost:3000/sitemap.xml |
| Robots | http://localhost:3000/robots.txt |

Next time, skip the build step if you did not change code: `npm run local -- --skip-build`.

## 3. Developing (live reload)

```powershell
npm run dev
```

Starts the API (http://localhost:3000), the website (http://localhost:4173)
and the CMS (http://localhost:5173) together. Press **Ctrl+C** to stop all three.

## 4. Signing in to the CMS

Use your existing CMS accounts — passwords were carried over. The owner
account (`CMS_ADMIN_EMAIL` in `.env`) is now a **Super Admin**.

If your password is weak (for example the old default), the CMS will ask you
to choose a stronger one straight after signing in.

Locked out? Reset the owner account from `.env`:

```powershell
npm run cms:reset-admin
```

## 5. Email while testing

Emails are sent for real using the SMTP settings in `.env` (Gmail app
password). To test without sending, start with:

```powershell
$env:SMTP_DRY_RUN="true"; npm run local
```

## 6. Run the automated tests

```powershell
npm test
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| CMS → System status says "Local file (store.json)" | PostgreSQL is not reachable. Check the `DATABASE_*` values in `.env` and that the PostgreSQL service is running (Windows Services → postgresql-x64-16). |
| `password authentication failed for user "gm_safaris_app"` | Run `npm run db:setup` with `PGADMIN_PASSWORD` set (it resets the app user's password to the one in `.env`). |
| `EADDRINUSE: address already in use :::3000` | Another copy is running. Close the other terminal, or run `npx kill-port 3000`. |
| A photo shows as broken | CMS → Media → **Needs attention** lists every missing or empty photo file. Upload a replacement and pick it on the tour / lodge. |
