import Lenis from '@studio-freight/lenis'
import {gsap, ScrollTrigger} from './gsap.config'

export type SmoothScroll = Lenis

let instance: SmoothScroll | null = null
let tickerFn: ((time: number) => void) | null = null

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Lenis + GSAP ScrollTrigger sync.
 *
 * The one rule that matters: there is exactly ONE animation loop. Lenis is
 * driven by gsap.ticker (not its own requestAnimationFrame) and every Lenis
 * scroll frame pushes ScrollTrigger.update(). Two independent RAF loops
 * fighting over scrollY is what produces the classic "smooth going down,
 * broken going up" bug.
 */
export function initSmoothScroll(): SmoothScroll | null {
  if (typeof window === 'undefined') return null
  // Guard against React StrictMode double-invocation / HMR.
  if (instance) return instance

  if (prefersReducedMotion()) {
    // Native scrolling, no smoothing, ScrollTrigger still works.
    ScrollTrigger.refresh()
    return null
  }

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 2,
    // Lenis adds classes to <html>; keep the native scrollbar for a11y.
    wheelMultiplier: 1,
  })

  instance = lenis

  lenis.on('scroll', ScrollTrigger.update)

  const raf = (time: number) => {
    lenis.raf(time * 1000)
  }
  tickerFn = raf
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  // Expose for anchor-link scrolling and the audit modal lock.
  ;(window as unknown as {__lenis?: Lenis}).__lenis = lenis

  return lenis
}

/**
 * Tears the singleton down and clears the module reference.
 *
 * This matters under React StrictMode: the mount effect runs, cleans up, then
 * runs again. If cleanup left `instance` pointing at a destroyed Lenis, the
 * second init would early-return a dead object and scroll would silently stop
 * working in dev.
 */
export function destroySmoothScroll() {
  if (tickerFn) {
    gsap.ticker.remove(tickerFn)
    tickerFn = null
  }
  if (instance) {
    instance.destroy()
    instance = null
  }
  if (typeof window !== 'undefined') {
    delete (window as unknown as {__lenis?: Lenis}).__lenis
  }
}

export function getLenis() {
  return instance
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = getLenis()
  if (lenis) {
    lenis.scrollTo(el, {offset: -72, duration: 1.15})
  } else {
    el.scrollIntoView({behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start'})
  }
}

export function stopScroll() {
  getLenis()?.stop()
  document.documentElement.style.overflow = 'hidden'
}

export function startScroll() {
  document.documentElement.style.overflow = ''
  getLenis()?.start()
}
