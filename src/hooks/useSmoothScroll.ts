import { useEffect, useRef } from "react"
import type Lenis from "@studio-freight/lenis"
import { initSmoothScroll } from "@/lib/smoothScroll"

/**
 * React binding for `initSmoothScroll`. Keeps the instance in a ref so
 * components can call `lenis.scrollTo(...)` (e.g. anchor links), and tears
 * everything down on unmount — including under StrictMode's double-invoke.
 */
export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const instance = initSmoothScroll()
    lenisRef.current = instance.lenis

    return () => {
      instance.destroy()
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}

export { gsap, ScrollTrigger } from "@/lib/smoothScroll"
