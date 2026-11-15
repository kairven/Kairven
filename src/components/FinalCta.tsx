import {ArrowUpRight, Mail} from 'lucide-react'
import {useAppStore} from '@/lib/store'
import {Reveal} from './ui/Reveal'
import {MagneticButton} from './ui/MagneticButton'
import {useSectionReveal} from '@/lib/useSectionReveal'

export function FinalCta() {
  const openAudit = useAppStore((s) => s.openAudit)
  const revealRef = useSectionReveal()

  return (
    <section ref={revealRef} className="relative overflow-hidden py-24 md:py-36">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(212,255,0,0.07),transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
        aria-hidden="true"
      />

      <div className="shell text-center">
        <Reveal>
          <span className="telemetry-tag">Next step</span>
        </Reveal>

        <Reveal delay={0.06}>
          <h2 className="mx-auto mt-6 max-w-3xl text-display leading-[1.02] font-medium tracking-[-0.035em] text-text-primary">
            Find out what your front desk
            <span className="block text-dim-gradient">is losing this month.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mx-auto mt-6 max-w-xl text-[1rem] leading-relaxed text-text-muted">
            A free diagnostic: we map your capture, response and follow-up path, then show you the
            two changes with the biggest recoverable revenue.
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <MagneticButton
              className="btn-volt px-7 py-4 text-[0.92rem]"
              onClick={() => openAudit('final-cta')}
            >
              Get the free diagnostic
              <ArrowUpRight className="ml-2 size-4" strokeWidth={2.5} />
            </MagneticButton>

            <a
              href="mailto:hello@kairven.com"
              className="btn-ghost inline-flex items-center px-7 py-4 text-[0.92rem] text-text-primary"
            >
              <Mail className="mr-2 size-4 text-text-muted" strokeWidth={1.8} />
              hello@kairven.com
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.24}>
          <p className="mt-7 font-mono text-[0.66rem] tracking-[0.08em] text-text-muted/60 uppercase">
            No sales call required · Reply within one business day
          </p>
        </Reveal>
      </div>
    </section>
  )
}
