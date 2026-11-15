import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {useGSAP} from '@gsap/react'

/**
 * Single registration point for every GSAP plugin the site uses.
 * ScrollTrigger, ScrollSmoother and SplitText are all free on npm as of
 * GSAP 3.12+, so nothing here needs a Club GreenSock license.
 *
 * Import this module (side-effect) anywhere before the first tween runs —
 * `main.tsx` imports it once at the top of the tree.
 */
gsap.registerPlugin(ScrollTrigger, useGSAP)

gsap.defaults({ease: 'power3.out', duration: 0.9})

// Don't let a busy main thread produce "catch-up" jumps in scroll-driven tweens.
gsap.ticker.lagSmoothing(0)

ScrollTrigger.config({
  // Mobile URL bars fire resize on every scroll; ignoring them stops the
  // pinned sections from recalculating their start/end mid-scroll.
  ignoreMobileResize: true,
})

export {gsap, ScrollTrigger, useGSAP}
