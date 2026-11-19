/**
 * Dev-only smoke test: boots the built bundle inside jsdom, mounts React, and
 * asserts the page renders without throwing and that key sections exist.
 * Run with: node scripts/smoke.mjs  (after `npm run build`)
 */
import {readFileSync, readdirSync} from 'node:fs'
import {JSDOM, VirtualConsole} from 'jsdom'

const html = readFileSync('dist/index.html', 'utf8')
const errors = []

const virtualConsole = new VirtualConsole()
virtualConsole.on('jsdomError', (e) => {
  const msg = String(e?.message ?? e)
  if (/Not implemented: (window\.scrollTo|HTMLCanvasElement|window\.matchMedia)/.test(msg)) return
  errors.push(`jsdomError: ${msg}`)
})
virtualConsole.on('error', (msg) => {
  const text = String(msg)
  if (/Not implemented/.test(text)) return
  errors.push(`console.error: ${text}`)
})

const dom = new JSDOM(html.replace(/<script type="module"[^>]*><\/script>/g, ''), {
  url: 'http://localhost:5173/',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
  virtualConsole,
  resources: undefined,
})

const {window} = dom

// --- Minimal browser APIs jsdom lacks -------------------------------------
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {
    return false
  },
})

class NoopIO {
  constructor(cb) {
    this.cb = cb
  }
  observe(el) {
    this.cb([{isIntersecting: true, target: el, intersectionRatio: 1}], this)
  }
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = NoopIO
window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.requestAnimationFrame = (cb) => window.setTimeout(() => cb(performance.now()), 16)
window.cancelAnimationFrame = (id) => window.clearTimeout(id)
window.scrollTo = () => {}
window.HTMLElement.prototype.scrollIntoView = () => {}
window.HTMLElement.prototype.scrollTo = () => {}
window.SVGElement.prototype.getBBox = () => ({x: 0, y: 0, width: 100, height: 20})
window.open = () => null

// --- Load the built entry --------------------------------------------------
// A single IIFE bundle built by `npm run smoke:bundle` (esbuild) so jsdom can
// execute it with a classic <script> tag — ESM chunks can't be loaded here.
const code = readFileSync('.smoke/bundle.js', 'utf8')
const scriptEl = window.document.createElement('script')
scriptEl.textContent = code
window.document.body.appendChild(scriptEl)

// Dynamic imports of lazy chunks are not requested by this harness; the
// initial render + eager sections are what we care about here.
await new Promise((r) => setTimeout(r, 800))

const doc = window.document
const root = doc.getElementById('root')
const checks = [
  ['#root has children', root && root.children.length > 0],
  ['hero h1 rendered', /front desk/i.test(root?.textContent ?? '')],
  ['nav rendered', !!doc.querySelector('header nav')],
  ['signal section', !!doc.getElementById('system')],
  ['skip link', /Skip to content/.test(doc.body.textContent ?? '')],
  ['noise overlay', !!doc.querySelector('.noise-overlay')],
]

// --- Interaction: open the audit modal from the navbar CTA ----------------
const clickByText = (needle) => {
  const el = [...doc.querySelectorAll('button')].find((b) =>
    (b.textContent ?? '').toLowerCase().includes(needle.toLowerCase()),
  )
  if (!el) return false
  el.dispatchEvent(new window.MouseEvent('click', {bubbles: true}))
  return true
}

const opened = clickByText('Free diagnostic')
await new Promise((r) => setTimeout(r, 400))
const dialog = doc.querySelector('[role="dialog"]')
checks.push(['audit modal opens', opened && !!dialog])
checks.push(['modal has 3 form fields', doc.querySelectorAll('[role="dialog"] input, [role="dialog"] textarea').length === 3])
checks.push(['modal shows server-side note', /never appears in this page/i.test(dialog?.textContent ?? '')])
checks.push(['bundle contains no phone number', !/wa\.me\/\d{8,}/.test(code)])

let failed = 0
for (const [label, ok] of checks) {
  console.log(`${ok ? '  ok ' : ' FAIL'}  ${label}`)
  if (!ok) failed++
}

if (errors.length) {
  console.log('\nRuntime errors captured:')
  errors.forEach((e) => console.log('  -', e))
}

// React hydration-time errors are the real signal here.
const realErrors = errors.filter((e) => !/WebGL|canvas|getContext/i.test(e))
if (realErrors.length || failed) {
  console.error(`\nsmoke: FAILED (${failed} assertions, ${realErrors.length} runtime errors)`)
  process.exit(1)
}

console.log('\nsmoke: passed')
