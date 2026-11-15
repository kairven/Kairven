# Deploying Kairven

Target: **Cloudflare Pages** (static assets + one Pages Function).

## First-time setup

```bash
npm install
npx wrangler login          # or set CLOUDFLARE_API_TOKEN
npx wrangler pages project create kairven --production-branch=main
```

Set the WhatsApp number as an encrypted secret — **not** in `wrangler.toml`,
which is committed:

```bash
npx wrangler pages secret put KAIRVEN_WHATSAPP_NUMBER --project-name=kairven
# digits only, e.g. 919876543210
```

## Deploy

```bash
npm run deploy
# = npm run build && wrangler pages deploy dist --project-name=kairven
```

`npm run build` runs `tsc && vite build`, so a type error aborts the deploy.

Preview locally against the real Pages runtime (headers, redirects and
Functions all behave as they will in production):

```bash
npm run preview:cf        # wrangler pages dev dist
```

## Layout that Pages expects

| Path | Purpose |
| --- | --- |
| `public/_headers` | cache + security headers → copied to `dist/_headers` |
| `public/_redirects` | redirects → copied to `dist/_redirects` |
| `functions/api/*.ts` | Pages Functions; **repo root**, not `dist` |
| `wrangler.toml` | `pages_build_output_dir = "dist"` |

`functions/` must sit beside `dist/`, not inside it. Wrangler compiles it into
the Worker automatically when you deploy from the repo root.

## Cache policy

| Path | Cache-Control | Why |
| --- | --- | --- |
| `/assets/*` | `max-age=31536000, immutable` | Vite content-hashes these |
| `/fonts/*` | `max-age=604800, stale-while-revalidate=86400` | **not** hashed |
| `/index.html`, `/` | `max-age=0, must-revalidate` | stale HTML points at dead asset hashes |
| `/og-image.jpg`, `/favicon.svg` | `max-age=86400` | edits should show within a day |

Fonts are deliberately **not** `immutable`: the filenames are stable, so a
one-year immutable cache would pin returning visitors to old bytes with no way
to bust it. Rename the file when the font changes.

## Note on the two route handlers

- `functions/api/route-to-whatsapp.ts` — **Cloudflare** Pages Function.
- `api/route-to-whatsapp.ts` — Vercel Edge signature.

Only one platform can be live. Delete the other, or the two endpoints will
drift. See the comment at the top of each file.
