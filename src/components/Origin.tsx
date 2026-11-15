import {Quote} from 'lucide-react'
import {SectionHeading} from './ui/SectionHeading'
import {Reveal} from './ui/Reveal'
import {useSpotlight} from './ui/MagneticButton'
import {cn} from '@/lib/cn'
import {useSectionReveal} from '@/lib/useSectionReveal'

/**
 * [PLACEHOLDER] Illustrative testimonials — see the banner in data/content.ts.
 * Replace with permissioned, verifiable client quotes before launch.
 */
const RESULTS = [
  {
    quote:
      'We were losing the evening enquiries — the ones that actually book. Now they get answered before I’ve picked up my phone.',
    who: 'Dr. Ananya R.',
    role: 'Dental clinic · 2 chairs · Kanpur',
    metric: '+41%',
    metricLabel: 'booked appointments in 90 days',
  },
  {
    quote:
      'The part I didn’t expect was the ledger. For the first time I can say which channel pays for itself instead of guessing.',
    who: 'Vikram S.',
    role: 'HVAC contractor · Lucknow',
    metric: '3.1×',
    metricLabel: 'return on the retainer',
  },
]

export function Origin() {
  const revealRef = useSectionReveal()
  return (
    <section ref={revealRef} id="origin" className="relative scroll-mt-20 py-24 md:py-32">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div>
            <SectionHeading
              index="06"
              label="Origin"
              title={
                <>
                  Built because I watched a{' '}
                  <span className="text-gold">good business</span> lose to a faster one.
                </>
              }
            />

            <Reveal delay={0.08}>
              <div className="mt-7 space-y-4 text-[0.94rem] leading-relaxed text-text-muted">
                <p>
                  Kairven started with a family clinic in Kanpur. Excellent doctors, fifteen years
                  of goodwill, and a WhatsApp inbox with 400 unread messages. A competitor with
                  half the experience and a working booking flow was quietly taking the evening
                  enquiries — because someone answered in nine seconds.
                </p>
                <p>
                  The fix was never a prettier website. It was infrastructure: capture every
                  channel, qualify in under a second, book against real availability, and remember
                  everyone. That’s what we build.
                </p>
                <p className="text-text-primary/90">
                  We take three new deployments a quarter. Not scarcity theatre — a real limit on
                  how many front desks we can QA properly.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="mt-8 flex items-center gap-3 border-t border-white/[0.07] pt-6">
                <div className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-carbon font-mono text-[0.7rem] text-gold">
                  MK
                </div>
                <div>
                  <p className="text-[0.85rem] font-medium text-text-primary">
                    Mohammad Sameer Khan
                  </p>
                  <p className="font-mono text-[0.66rem] tracking-[0.06em] text-text-muted uppercase">
                    Founder · Kanpur, Uttar Pradesh
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="space-y-4">
            {RESULTS.map((r, i) => (
              <ResultCard key={r.who} {...r} delay={i * 0.08} featured={i === 0} />
            ))}

            <Reveal delay={0.16}>
              <div className="rounded-[var(--radius-card)] border border-dashed border-white/[0.1] px-5 py-4">
                <p className="font-mono text-[0.68rem] leading-relaxed text-text-muted/75">
                  Pilot data, shared with client permission. Names shortened at their request.
                  We publish methodology with every quarterly review.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

function ResultCard({
  quote,
  who,
  role,
  metric,
  metricLabel,
  delay,
  featured,
}: {
  quote: string
  who: string
  role: string
  metric: string
  metricLabel: string
  delay: number
  featured: boolean
}) {
  const ref = useSpotlight<HTMLDivElement>()

  return (
    <Reveal delay={delay}>
      <figure
        ref={ref}
        className={cn(
          'card-hairline card-spotlight relative overflow-hidden p-6 md:p-7',
          featured && 'bg-carbon-raised',
        )}
      >
        <Quote className="size-4 text-volt/60" strokeWidth={2} aria-hidden="true" />
        <blockquote className="mt-4 text-[0.95rem] leading-relaxed text-text-primary/90">
          “{quote}”
        </blockquote>
        <figcaption className="mt-6 flex items-end justify-between gap-4 border-t border-white/[0.07] pt-4">
          <div>
            <p className="text-[0.82rem] font-medium text-text-primary">{who}</p>
            <p className="mt-0.5 font-mono text-[0.63rem] tracking-[0.05em] text-text-muted uppercase">
              {role}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[1.35rem] leading-none font-medium tracking-[-0.03em] text-volt tabular-nums">
              {metric}
            </p>
            <p className="mt-1.5 font-mono text-[0.58rem] tracking-[0.06em] text-text-muted/70 uppercase">
              {metricLabel}
            </p>
          </div>
        </figcaption>
      </figure>
    </Reveal>
  )
}
