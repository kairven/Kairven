import {useEffect, useRef} from 'react'
import {gsap, ScrollTrigger} from '@/lib/gsap.config'

/** Hairline progress bar, driven by the same ScrollTrigger instance as the page. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        gsap.set(bar, {scaleX: self.progress, transformOrigin: 'left center'})
      },
    })
    return () => st.kill()
  }, [])

  return (
    <div className="fixed inset-x-0 top-0 z-[55] h-px" aria-hidden="true">
      <div ref={barRef} className="h-full origin-left scale-x-0 bg-volt/70" />
    </div>
  )
}
