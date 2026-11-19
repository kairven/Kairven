import {ArrowDown, ArrowUpRight, MessageCircle} from 'lucide-react'
import {lazy, Suspense, useRef} from 'react'
import {useAppStore} from '@/lib/store'
import {prefersReducedMotion, scrollToId} from '@/lib/smoothScroll'
import {gsap, useGSAP} from '@/lib/gsap.config'
import {MagneticButton} from './ui/MagneticButton'
import {METRICS} from '@/data/content'
import {HeroMetrics} from './HeroMetrics'

const WebGLField = lazy(() => import('./WebGLField'))

export function Hero() {
  const openAudit = useAppStore((s) => s.openAudit)
  const scope = useRef<HTMLElement | null>(null)

  // One timeline for the whole hero. Splitting this into per-element tweens
  // is how you get a staggered mess on a slow first paint.
  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>('.hero-in')
      if (!items.length) return

      if (prefersReducedMotion()) {
        gsap.set(items, {opacity: 1, y: 0})
        return
      }

      gsap.set(items, {opacity: 0, y: 26})
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 1.05,
        stagger: 0.085,
        delay: 0.15,
        ease: 'power3.out',
        // Clear inline transforms so position: sticky/fixed children behave.
        clearProps: 'transform',
      })
    },
    {scope},
  )

  return (
    <section
      ref={scope}
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pt-24 pb-10"
    >
      {/* Base layer is CSS — the GL canvas fades in over it once mounted. */}
      <div className="mesh-bg absolute inset-0 -z-20" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 opacity-90" aria-hidden="true">
        <Suspense fallback={null}>
          <WebGLField />
        </Suspense>
      </div>

      {/* Bottom fade into the page body */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-b from-transparent to-[#050507]"
        aria-hidden="true"
      />

      {/* Technical grid, hairline only */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.55]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '88px 88px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, #000 20%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 40%, #000 20%, transparent 78%)',
        }}
      />

      <div className="shell relative">
        <div className="max-w-4xl">
          <div className="hero-in flex items-center gap-3">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-volt opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-volt" />
            </span>
            <span className="telemetry-tag">Kanpur, IN — 3 build slots for Q1</span>
          </div>

          <h1 className="hero-in mt-7 text-display font-medium">
            <span className="block text-text-primary">Your front desk</span>
            <span className="block text-dim-gradient">never sleeps.</span>
          </h1>

          <p className="hero-in mt-7 max-w-xl text-[1.05rem] leading-relaxed text-text-muted">
            Kairven builds the AI front desk, lead ledger and search presence that clinics and
            home-service operators run on — so an enquiry at 11:40pm becomes a booking at 11:41pm,
            not a missed call.
          </p>

          <div className="hero-in mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <MagneticButton
              className="btn-volt px-6 py-3.5 text-[0.92rem]"
              onClick={() => openAudit('hero')}
            >
              Get the free diagnostic
              <ArrowUpRight className="ml-2 size-4" strokeWidth={2.5} />
            </MagneticButton>

            <MagneticButton
              className="btn-ghost px-6 py-3.5 text-[0.92rem] text-text-primary"
              onClick={() => scrollToId('sandbox')}
              strength={0.2}
            >
              <MessageCircle className="mr-2 size-4 text-volt" strokeWidth={2} />
              Watch it handle a customer
            </MagneticButton>
          </div>

          <HeroMetrics metrics={METRICS} />
        </div>
      </div>

      <button
        onClick={() => scrollToId('system')}
        className="mono-label absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 transition-colors hover:text-text-primary md:flex"
        aria-label="Scroll to system overview"
      >
        Scroll
        <ArrowDown className="size-3 animate-bounce" />
      </button>
    </section>
  )
}
