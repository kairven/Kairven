// lib/smoothScroll.ts
//
// Lenis + GSAP ScrollTrigger, wired so a single rAF loop drives both.
//
// The rule that matters: Lenis must NOT run its own requestAnimationFrame
// loop while ScrollTrigger is in play. Both read scroll position, and if they
// tick on different frames, pinned sections jitter and trigger start/end
// values land one frame late. Driving `lenis.raf` from `gsap.ticker` puts
// scroll smoothing and every GSAP tween on the same clock.

import Lenis from "@studio-freight/lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export interface SmoothScrollOptions {
  duration?: number
  touchMultiplier?: number
  smoothWheel?: boolean
  /** Skip Lenis entirely when the user asks for reduced motion. */
  respectReducedMotion?: boolean
}

export interface SmoothScrollInstance {
  lenis: Lenis | null
  destroy: () => void
}

export function initSmoothScroll({
  duration = 1.2,
  touchMultiplier = 2,
  smoothWheel = true,
  respectReducedMotion = true,
}: SmoothScrollOptions = {}): SmoothScrollInstance {
  const prefersReduced =
    respectReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // Bail out to native scrolling. ScrollTrigger still works perfectly —
  // it just listens to the window instead of Lenis.
  if (prefersReduced) {
    ScrollTrigger.refresh()
    return { lenis: null, destroy: () => {} }
  }

  const lenis = new Lenis({
    duration,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel,
    touchMultiplier,
    // NB: this is *why* we don't set `syncTouch`. On iOS, Lenis's virtual
    // touch scroll fights Safari's native momentum. Leaving syncTouch off
    // means touch falls back to the compositor, which is what you want.
  })

  // Critical: drive GSAP's ticker from Lenis, not a separate rAF.
  lenis.on("scroll", ScrollTrigger.update)

  const tick = (time: number) => {
    // GSAP's ticker hands us seconds; Lenis.raf expects milliseconds.
    lenis.raf(time * 1000)
  }

  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  // Lenis takes over scroll position, so trigger measurements made before it
  // initialised can be stale. Re-measure once on the next frame.
  const refreshId = requestAnimationFrame(() => ScrollTrigger.refresh())

  return {
    lenis,
    destroy: () => {
      cancelAnimationFrame(refreshId)
      // Order matters: stop feeding the ticker before killing Lenis,
      // otherwise the next tick reads a destroyed instance.
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33) // back to GSAP's defaults
      lenis.off("scroll", ScrollTrigger.update)
      lenis.destroy()
    },
  }
}

export { gsap, ScrollTrigger }
