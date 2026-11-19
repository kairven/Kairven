# Kairven — site

Marketing site for Kairven: an AI front desk, lead ledger and search-visibility
system for clinics, home services and local businesses in India.

React 18 + TypeScript + Vite 5 + Tailwind 4, with GSAP/Lenis motion, an OGL WebGL
hero field, and a server-side WhatsApp routing endpoint.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

The audit endpoint needs the WhatsApp number in the server environment — if it's
missing the modal still renders and returns a clear error instead of failing
silently:

```bash
KAIRVEN_WHATSAPP_NUMBER=919999999999 npm run dev
```

```bash
npm run build      # tsc --noEmit && vite build
npm run preview    # serves dist/ on :4173, shares the same /api middleware
npm run smoke      # jsdom render + interaction test against .smoke/bundle.js
```

### Smoke test

`npm run smoke:bundle && npm run smoke` bundles the app with esbuild into an
IIFE, mounts it in jsdom, and asserts the page renders, the audit modal opens
with its three fields, and that no `wa.me/<number>` string is present in the
bundle. It exists because TypeScript cannot catch bad runtime exports — it
already caught one (`react-countup`'s CJS default resolving to a namespace
object under Vite's interop, which crashed the hero).

---

## Layout

```
api/route-to-whatsapp.ts    Cloudflare Pages Function (server-side WhatsApp routing)
vite.audit-plugin.ts        mounts the same handler in dev/preview — one code path
src/
  components/sections       Hero, SignalSystem, SandboxDemo, Architecture,
                            Comparison, Pricing, Origin, Faq, FinalCta
  components/ui             MagneticButton, Reveal, SectionHeading, CountUpValue
  lib/                      gsap.config, smoothScroll, store, auditRequest
  data/content.ts           all copy + pricing + FAQ (see placeholder banner)
  styles/                   fonts.css (self-hosted), global.css (tokens)
public/
  fonts/                    latin-subset woff2, preloaded from index.html
  _headers, _redirects      Cloudflare Pages caching + SPA fallback
```

---

## The four decisions worth knowing

### 1. The WhatsApp number is server-side, always

The number lives in `KAIRVEN_WHATSAPP_NUMBER`, read only by
`api/route-to-whatsapp.ts`. The client posts `{name, business, painPoint}` to
`/api/route-to-whatsapp` and follows the `redirect` URL that comes back.

Why it matters: a number hardcoded in a client bundle is scraped within days of
launch — the site becomes a free lead source for whoever harvests it first.
Rotating it would also mean a redeploy instead of a secret update. The endpoint
additionally:

- rejects cross-origin POSTs (cheap CSRF guard),
- strips control characters and caps field lengths before anything is encoded,
- sends via the Meta Cloud API when `KAIRVEN_WA_TOKEN` + `KAIRVEN_WA_PHONE_ID`
  are set, and otherwise falls back to a `wa.me` deep link,
- 405s on GET so the route can't be probed for a number.

Set the secret:

```bash
npx wrangler pages secret put KAIRVEN_WHATSAPP_NUMBER --project-name kairven
```

### 2. One animation loop, not two

`src/lib/smoothScroll.ts` drives Lenis from `gsap.ticker` and pushes every Lenis
frame into `ScrollTrigger.update()`. There is no second `requestAnimationFrame`
and no second Lenis instance — that duplication is what produces the "smooth
scrolling down, broken scrolling up" bug.

`destroySmoothScroll()` clears the module singleton on unmount. Without it,
React StrictMode's mount → cleanup → mount cycle leaves a destroyed instance in
place and dev scrolling dies after the first render.

### 3. The horizontal section is a transform, and it tears itself down

`Architecture.tsx` translates a track element inside a pinned wrapper — never
`width` or `left`, which would relayout every frame — with
`invalidateOnRefresh: true` so the travel distance re-measures on resize.

The whole thing sits inside `gsap.matchMedia()`, so crossing 1024px reverts the
pin and transform instead of leaving a horizontal track pinned on a phone.
Reduced-motion users get a plain vertical stack.

### 4. Below-the-fold work is code-split

`Architecture`, `Comparison`, `Pricing`, `Origin`, `FinalCta` and the footer are
`lazy()`. The WebGL field is imported only after the hero canvas is in view, is
drawn as a single fullscreen triangle, caps DPR at 1.5, and stops its render loop
when scrolled out of view or when the tab is hidden.

Because late mounts change document height, each section runs
`useSectionReveal()` — one deferred `ScrollTrigger.refresh()` — or every trigger
below the fold measures wrong.

---

## Before you launch: replace the placeholders

`src/data/content.ts` opens with a banner, and `PLACEHOLDER_DATA_IS_REAL` is
`false`. While it's false a dev-mode console warning fires.

The following are **illustrative copy, not verified client data**:

| Where | What |
| --- | --- |
| `Origin.tsx` → `RESULTS` | Two testimonials with named clients and metrics |
| `content.ts` → `METRICS` | Hero figures (38s response, 7.4× lift…) |
| `content.ts` → `COMPARISON` | Before/after aggregates |
| `content.ts` → `SIGNAL_STAGES[].metric` | Stage metrics (+31% show, 4.6× LTV) |

Publishing invented testimonials or unsupported performance claims is misleading
advertising under Indian consumer-protection rules, and it is the fastest way to
lose the trust the design is trying to buy. Swap each for a real, permissioned
result — or delete the block; the layout survives without it.

Also replace before launch:

- `hello@kairven.com` and `https://kairven.com` (Footer, `FinalCta.tsx`, `index.html`)
- the address in `index.html` JSON-LD and the footer
- `https://kairven.com/og-image.jpg` — add a real 1200×630 file to `public/`
- the `makesOffer` prices in the JSON-LD if you change `PRICING`

---

## SEO / GEO / AEO

- `ProfessionalService` JSON-LD with founder, locality and service area — facts,
  not adjectives, because that's what answer engines quote.
- `FAQPage` JSON-LD mirrors the visible FAQ strings exactly. They are duplicated
  in `index.html` and `data/content.ts`; if you edit one, edit both.
- Fonts are self-hosted latin-subset woff2 in `public/fonts`, preloaded from
  `<head>`, so there is no third-party font round-trip on the critical path.
- `public/_headers` sets `immutable, max-age=31536000` on hashed assets and
  `max-age=0, must-revalidate` on `index.html` so deploys propagate instantly.

---

## Deploy (Cloudflare Pages)

```bash
npm run build
npx wrangler pages deploy dist --project-name=kairven
```

Pages evaluates `api/` as Functions and serves `public/_headers` + `_redirects`
from `dist/`. Secrets are set with `wrangler pages secret put` — never in
`wrangler.toml`, never in a `VITE_`-prefixed variable (those are inlined into the
client bundle at build time, which would reintroduce exactly the problem the
endpoint solves).

## Accessibility & motion

Skip link, focus-visible rings, Radix dialog focus trap and scroll lock, native
`<details>` for the FAQ, `aria-live` on the demo thread. Every motion path checks
`prefers-reduced-motion` — Lenis isn't even initialised when it's set.
