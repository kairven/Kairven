# Project structure — copy/paste blueprint

The exact tree for this build. Copy the directories, then the file bodies you need.
Nothing here is generated — it's the real layout of the repo.

```
kairven/
├── api/
│   └── route-to-whatsapp.ts        ← serverless function (server-side number)
├── public/
│   ├── fonts/                       ← self-hosted woff2 (latin subset)
│   │   ├── instrument-sans-latin-wght-normal.woff2
│   │   ├── jetbrains-mono-latin-400-normal.woff2
│   │   └── jetbrains-mono-latin-500-normal.woff2
│   ├── _headers                     ← Cloudflare Pages caching + CSP
│   ├── _redirects                   ← SPA fallback
│   └── favicon.svg
├── scripts/
│   └── smoke.mjs                    ← jsdom render + interaction test
├── src/
│   ├── components/
│   │   ├── ui/                      ← reusable primitives
│   │   │   ├── MagneticButton.tsx
│   │   │   ├── Reveal.tsx
│   │   │   ├── SectionHeading.tsx
│   │   │   └── CountUpValue.tsx
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── HeroMetrics.tsx
│   │   ├── WebGLField.tsx           ← OGL shader canvas (lazy)
│   │   ├── TrustStrip.tsx           ← CSS marquee
│   │   ├── SignalSystem.tsx         ← 4a animated SVG path
│   │   ├── SandboxDemo.tsx          ← 4b scripted chat
│   │   ├── Architecture.tsx         ← 4c pinned horizontal
│   │   ├── Comparison.tsx
│   │   ├── Pricing.tsx              ← 4d currency toggle
│   │   ├── Origin.tsx
│   │   ├── Faq.tsx
│   │   ├── FinalCta.tsx
│   │   ├── Footer.tsx
│   │   ├── AuditModal.tsx           ← 4e diagnostic → WhatsApp
│   │   └── ScrollProgress.tsx
│   ├── data/
│   │   └── content.ts               ← ALL copy, pricing, FAQ, nav
│   ├── lib/
│   │   ├── gsap.config.ts           ← single plugin registration
│   │   ├── smoothScroll.ts          ← Lenis ⟷ ScrollTrigger sync
│   │   ├── useSectionReveal.ts      ← refresh after lazy mount
│   │   ├── auditRequest.ts          ← client half of the API call
│   │   ├── store.ts                 ← zustand (currency + modal)
│   │   └── cn.ts                    ← clsx + tailwind-merge
│   ├── styles/
│   │   ├── global.css               ← @theme tokens + components
│   │   └── fonts.css                ← @font-face declarations
│   ├── App.tsx                      ← section order + lazy boundaries
│   ├── main.tsx                     ← entry
│   └── vite-env.d.ts
├── index.html                       ← meta, OG, 2× JSON-LD, font preload
├── vite.config.ts                   ← alias, plugins, manualChunks
├── vite.audit-plugin.ts             ← mounts api/ handler in dev
├── tsconfig.json
├── wrangler.toml
├── .env.example
├── .gitignore
└── package.json
```

## Sizes (so you know what you're inheriting)

| File | Lines |
| --- | --- |
| `src/styles/global.css` | 319 |
| `src/components/AuditModal.tsx` | 296 |
| `src/components/SandboxDemo.tsx` | 283 |
| `src/components/WebGLField.tsx` | 279 |
| `src/data/content.ts` | 228 |
| `src/components/Architecture.tsx` | 194 |
| `src/components/SignalSystem.tsx` | 169 |
| `src/components/Navbar.tsx` | 166 |
| `src/components/Pricing.tsx` | 164 |
| `src/components/Origin.tsx` | 157 |
| **total `src/` + `api/`** | **~3,800** |

---

# 1. Scaffold

```bash
mkdir my-site && cd my-site
npm init -y
```

Then set `"type": "module"` and `"private": true` in `package.json`, and add:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview --host 0.0.0.0",
  "typecheck": "tsc --noEmit",
  "smoke:bundle": "esbuild src/main.tsx --bundle --format=iife --outfile=.smoke/bundle.js --loader:.css=empty --alias:@=./src --define:process.env.NODE_ENV=\"development\" --jsx=automatic --log-level=warning",
  "smoke": "node scripts/smoke.mjs"
}
```

```bash
mkdir -p api public/fonts scripts src/components/ui src/data src/lib src/styles
```

# 2. Install (exact versions used here)

```bash
# runtime — 14 packages
npm i react@18.3.1 react-dom@18.3.1 gsap@3.12.7 @gsap/react@2.1.2 \
  @studio-freight/lenis@1.0.42 ogl@1.0.6 zustand@4.5.7 react-countup@6.5.3 \
  clsx@2.1.1 tailwind-merge@3.7.0 class-variance-authority@0.7.1 \
  lucide-react@0.456.0 @radix-ui/react-dialog@1.3.1 @radix-ui/react-toggle-group@1.2.1

# dev — 10 packages
npm i -D vite@5.4.21 @vitejs/plugin-react@4.7.0 typescript@5.6.3 \
  tailwindcss@4.3.5 @tailwindcss/vite@4.3.5 @types/react@18.3.31 \
  @types/react-dom@18.3.7 @types/node esbuild@0.24.0 jsdom@31.0.1
```

### Version traps I hit

| Don't | Do | Why |
| --- | --- | --- |
| `@vitejs/plugin-react@latest` | pin `@4` | v6 requires `vite@^8`; `npm i` fails with ERESOLVE against vite 5 |
| `typescript@latest` | pin `5.6.3` | latest resolved to 7.x |
| `tailwindcss` + `postcss` + `autoprefixer` | `tailwindcss@4` + `@tailwindcss/vite` | Tailwind 4 has a Vite plugin; the PostCSS path needs a separate `@tailwindcss/postcss` and is no longer required |
| `framer-motion` alongside GSAP | omit it | redundant here — it cost a 122 kB chunk for nothing GSAP didn't do |

# 3. Config files

## `vite.config.ts`

```ts
import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {auditEndpoint} from './vite.audit-plugin'

export default defineConfig({
  plugins: [react(), tailwindcss(), auditEndpoint()],
  resolve: {
    alias: {'@': fileURLToPath(new URL('./src', import.meta.url))},
  },
  server: {host: '0.0.0.0', port: 5173, allowedHosts: true},
  preview: {host: '0.0.0.0', port: 4173, allowedHosts: true},
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {motion: ['gsap', '@gsap/react', 'gsap/ScrollTrigger']},
      },
    },
  },
})
```

> `allowedHosts: true` is only needed because this runs behind a preview proxy.
> Drop it for a normal local-only dev server.

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {"@/*": ["src/*"]}
  },
  "include": ["src", "api", "vite.config.ts"]
}
```

## `src/vite-env.d.ts`

```ts
/// <reference types="vite/client" />
```

## `.gitignore`

```
node_modules/
dist/
.smoke/
.env
.env.*
!.env.example
.wrangler/
.DS_Store
*.log
```

---

# 4. The build order that avoids rework

Do it in this sequence — each layer assumes the previous one exists. Building
components first is how you end up rewriting them when the token names change.

| # | Step | Why here |
| --- | --- | --- |
| 1 | `styles/global.css` — tokens + `.card-hairline`, `.noise-overlay`, `.mesh-bg`, `.glass-panel`, `.telemetry-tag` | every component consumes these classes; settle names first |
| 2 | `lib/cn.ts` | one-liner, everything imports it |
| 3 | `lib/gsap.config.ts` | registers plugins once; components import from here, never from `gsap` directly |
| 4 | `lib/smoothScroll.ts` | the single animation loop; must exist before any ScrollTrigger |
| 5 | `lib/store.ts` | currency + modal state before pricing/modal exist |
| 6 | `data/content.ts` | all copy in one file so components stay dumb |
| 7 | `components/ui/*` | primitives before sections |
| 8 | `components/` sections in page order | Hero → TrustStrip → Signal → Sandbox → Architecture → Comparison → Pricing → Origin → Faq → FinalCta → Footer |
| 9 | `App.tsx` | wire order + lazy boundaries |
| 10 | `main.tsx` | entry, font + gsap + css imports |
| 11 | `index.html` | meta, JSON-LD, font preload |
| 12 | `api/` + `vite.audit-plugin.ts` | the endpoint last; nothing above depends on it |

---

# 5. The four pieces people get wrong

These are the parts that aren't obvious from a component tree. Full bodies are in
the repo; this is the shape to preserve.

## 5.1 One loop — `lib/smoothScroll.ts`

```ts
const lenis = new Lenis({duration: 1.2, smoothWheel: true, touchMultiplier: 2})

lenis.on('scroll', ScrollTrigger.update)      // ← push Lenis frames into ST
gsap.ticker.add((t) => lenis.raf(t * 1000))   // ← drive Lenis from GSAP's ticker
gsap.ticker.lagSmoothing(0)
```

**Rule:** no second `requestAnimationFrame`, no second `Lenis()` instance. That
duplication is what produces "smooth scrolling down, broken scrolling up".

Also export a `destroySmoothScroll()` that removes the ticker fn **and nulls the
module singleton**. Without the null, React StrictMode's mount→cleanup→mount
leaves a destroyed instance in place and scrolling silently dies in dev.

## 5.2 Pinned horizontal — `components/Architecture.tsx`

```ts
mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
  const tween = gsap.to(track, {
    x: () => -(track.scrollWidth - window.innerWidth),   // function, not a number
    ease: 'none',
    scrollTrigger: {
      trigger: wrapper,
      start: 'top top',
      end: () => `+=${track.scrollWidth - window.innerWidth}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,     // ← re-measures on resize
    },
  })
})
```

Three non-negotiables:
- animate `x` on a **track element**, never `width`/`left` on the panels
- `invalidateOnRefresh: true`, and pass `x`/`end` as **functions**
- wrap in `matchMedia` so crossing the breakpoint reverts the pin

Plus: **no `overflow: hidden` on any ancestor of the pinned element.** ScrollTrigger
moves it to `position: fixed`; a clipped ancestor makes it vanish.

## 5.3 The number never ships — `api/` + `lib/auditRequest.ts`

```ts
// api/route-to-whatsapp.ts  (server only)
const waNumber = env.KAIRVEN_WHATSAPP_NUMBER
return json({redirect: `https://wa.me/${waNumber}?text=${text}`})
```

```ts
// client
const res = await fetch('/api/route-to-whatsapp', {method: 'POST', body: JSON.stringify(payload)})
window.open((await res.json()).redirect, '_blank')
```

Verify in CI before shipping:

```bash
grep -ro "wa\.me/[0-9]\{6,\}" dist/ && echo "LEAKED" || echo "clean"
```

## 5.4 Lazy sections need a second `ScrollTrigger.refresh()`

When a section mounts after the initial refresh, document height changes and every
trigger below it measures wrong. Hence `lib/useSectionReveal.ts`, called once per
lazily-mounted section:

```ts
useEffect(() => {
  const id = requestAnimationFrame(() => ScrollTrigger.refresh())
  return () => cancelAnimationFrame(id)
}, [])
```

---

# 6. Run

```bash
KAIRVEN_WHATSAPP_NUMBER=919999999999 npm run dev   # :5173
npm run build                                     # tsc --noEmit && vite build
npm run smoke:bundle && npm run smoke             # jsdom render + modal + leak check
```

The env var is **server-side**. Never rename it to `VITE_KAIRVEN_...` — anything
prefixed `VITE_` is inlined into the client bundle at build time, which puts you
right back where the spec started.
