import {useRef, type ReactNode} from 'react'
import {gsap, useGSAP} from '@/lib/gsap.config'
import {prefersReducedMotion} from '@/lib/smoothScroll'
import {cn} from '@/lib/cn'

type Props = {
  children: ReactNode
  className?: string
  /** Seconds of stagger delay. */
  delay?: number
  y?: number
  as?: 'div' | 'section' | 'li' | 'p' | 'span' | 'h2'
}

/**
 * Shared entrance primitive. GSAP batch on ScrollTrigger `once` — cheaper than
 * a new IntersectionObserver per element and it respects the Lenis loop.
 */
export function Reveal({children, className, delay = 0, y = 22, as = 'div'}: Props) {
  const scope = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const el = scope.current
      if (!el) return
      if (prefersReducedMotion()) {
        gsap.set(el, {opacity: 1, y: 0})
        return
      }
      gsap.fromTo(
        el,
        {opacity: 0, y},
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          delay,
          ease: 'power3.out',
          scrollTrigger: {trigger: el, start: 'top 88%', once: true},
        },
      )
    },
    {scope, dependencies: [delay, y]},
  )

  const Tag = as as 'div'
  return (
    <Tag ref={scope as React.RefObject<HTMLDivElement>} className={cn(className)}>
      {children}
    </Tag>
  )
}
