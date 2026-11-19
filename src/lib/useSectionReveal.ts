import {useEffect, useRef} from 'react'
import {ScrollTrigger} from './gsap.config'

/**
 * Code-split sections mount AFTER the initial ScrollTrigger.refresh(). Without
 * a second refresh, every trigger measured below the fold is off by however
 * much the late section added to the document height.
 *
 * This runs one deferred refresh per late section, coalesced on the next frame.
 */
export function useSectionReveal() {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })
    return () => window.cancelAnimationFrame(id)
  }, [])

  return ref
}
