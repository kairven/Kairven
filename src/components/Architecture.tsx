import {useRef} from 'react'
import {gsap, useGSAP} from '@/lib/gsap.config'
import {ARCH_PANELS} from '@/data/content'
import {SectionHeading} from './ui/SectionHeading'
import {cn} from '@/lib/cn'
import {useSectionReveal} from '@/lib/useSectionReveal'

/**
 * Pinned horizontal sequence.
 *
 * The trap: animating width/left triggers layout on every frame. We translate
 * a track element inside a pinned wrapper instead — compositor-only work.
 *
 * `invalidateOnRefresh: true` keeps the travel distance correct on resize.
 * The whole thing lives inside `gsap.matchMedia()` so crossing the lg
 * breakpoint tears the pin down and reverts the transform instead of leaving
 * a horizontal track pinned on a phone.
 */
export function Architecture() {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const scope = useRef<HTMLDivElement | null>(null)
  const revealRef = useSectionReveal()

  // Both refs point at the same <section>: one for GSAP scoping, one for the
  // post-mount ScrollTrigger refresh.
  const mergedRef = (node: HTMLDivElement | null) => {
    scope.current = node
    ;(revealRef as React.MutableRefObject<HTMLElement | null>).current = node
  }

  useGSAP(
    () => {
      const track = trackRef.current
      const wrapper = wrapperRef.current
      if (!track || !wrapper) return

      const mm = gsap.matchMedia()

      // Desktop + motion allowed: pin and scrub horizontally.
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const panels = gsap.utils.toArray<HTMLElement>('.h-panel', track)
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)

        // Reset anything a previous (mobile) state may have left behind.
        gsap.set(track, {x: 0})
        gsap.set(panels, {clearProps: 'opacity,transform'})

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: wrapper,
            start: 'top top',
            end: () => `+=${distance()}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        // Per-panel emphasis: each panel sharpens as it reaches centre.
        const emphasis = panels.map((panel) => {
          const content = panel.querySelector('.h-panel-inner')
          if (!content) return null
          return gsap.fromTo(
            content,
            {opacity: 0.3, y: 16},
            {
              opacity: 1,
              y: 0,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: panel,
                containerAnimation: tween,
                start: 'left 82%',
                end: 'left 44%',
                scrub: true,
              },
            },
          )
        })

        return () => {
          emphasis.forEach((t) => {
            t?.scrollTrigger?.kill()
            t?.kill()
          })
          gsap.set(track, {clearProps: 'transform'})
          gsap.set(panels, {clearProps: 'opacity,transform'})
        }
      })

      // Mobile / reduced motion: plain vertical stack, no pin, no transform.
      mm.add('(max-width: 1023px), (prefers-reduced-motion: reduce)', () => {
        gsap.set(track, {clearProps: 'transform'})
        gsap.set(gsap.utils.toArray<HTMLElement>('.h-panel-inner', track), {
          clearProps: 'opacity,transform',
        })
      })

      return () => mm.revert()
    },
    {scope},
  )

  return (
    <section
      id="architecture"
      ref={mergedRef}
      className="relative scroll-mt-20 border-y border-white/[0.06] bg-[#07070a]"
    >
      <div className="shell pt-24 md:pt-32">
        <SectionHeading
          index="03"
          label="Architecture"
          title={
            <>
              Four layers, one ledger.
              <br />
              <span className="text-text-muted">No mystery in the middle.</span>
            </>
          }
          lede="Scroll sideways. Each layer is a real system with a job, an owner and a failure mode you can read about before you buy — not a feature list."
        />
        <p className="mono-label mt-6 hidden lg:block">→ horizontal · scroll to advance</p>
      </div>

      <div ref={wrapperRef} className="relative mt-12 pb-24 md:pb-32">
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex flex-col gap-4 px-6 md:px-10 lg:h-[min(62vh,560px)] lg:flex-row lg:items-stretch lg:gap-6 lg:px-[max(2.5rem,calc((100vw-74rem)/2+2.5rem))] lg:will-change-transform"
          >
            {ARCH_PANELS.map((panel, i) => (
              <article
                key={panel.id}
                className={cn(
                  'h-panel card-hairline group relative flex shrink-0 flex-col justify-between overflow-hidden p-7 md:p-9',
                  'w-full lg:w-[min(78vw,620px)]',
                )}
              >
                <div
                  className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-[radial-gradient(closest-side,rgba(212,255,0,0.06),transparent)]"
                  aria-hidden="true"
                />
                <div className="h-panel-inner">
                  <div className="flex items-center justify-between">
                    <span className="telemetry-tag">{panel.eyebrow}</span>
                    <span className="font-mono text-[0.66rem] text-text-muted/60">
                      0{i + 1} / 0{ARCH_PANELS.length}
                    </span>
                  </div>

                  <h3 className="mt-10 text-[2rem] font-medium tracking-[-0.035em] text-text-primary md:text-[2.6rem]">
                    {panel.title}
                  </h3>
                  <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-text-muted">
                    {panel.body}
                  </p>
                </div>

                <ul className="h-panel-inner mt-10 space-y-2.5 border-t border-white/[0.07] pt-6">
                  {panel.points.map((point) => (
                    <li key={point} className="flex items-center gap-2.5">
                      <span className="size-1 rounded-full bg-volt" aria-hidden="true" />
                      <span className="text-[0.82rem] text-text-primary/85">{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="absolute right-0 bottom-0 left-0 flex h-[2px]">
                  {ARCH_PANELS.map((_, idx) => (
                    <span
                      key={idx}
                      className={cn('h-full flex-1', idx === i ? 'bg-volt/70' : 'bg-white/[0.06]')}
                    />
                  ))}
                </div>
              </article>
            ))}

            <div className="h-panel hidden w-[280px] shrink-0 items-end lg:flex">
              <p className="pb-2 font-mono text-[0.68rem] leading-relaxed tracking-[0.08em] text-text-muted/70 uppercase">
                End of stack →
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
