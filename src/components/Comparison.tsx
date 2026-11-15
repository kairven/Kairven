import {ArrowRight, Minus, Plus} from 'lucide-react'
import {COMPARISON} from '@/data/content'
import {SectionHeading} from './ui/SectionHeading'
import {Reveal} from './ui/Reveal'
import {useSectionReveal} from '@/lib/useSectionReveal'

export function Comparison() {
  const revealRef = useSectionReveal()
  return (
    <section ref={revealRef} className="relative py-24 md:py-32">
      <div className="shell">
        <SectionHeading
          index="04"
          label="Before / after"
          title={
            <>
              The gap isn’t marketing.
              <br />
              <span className="text-text-muted">It’s latency and memory.</span>
            </>
          }
          lede="Two businesses, same street, same service, same price. One answers in 38 seconds and remembers everyone. The other checks WhatsApp when the day ends."
        />

        <div className="mt-14 overflow-hidden rounded-[var(--radius-panel)] border border-white/[0.07]">
          <div className="grid grid-cols-2 gap-px bg-white/[0.06] md:grid-cols-[1.15fr_1fr_1fr]">
            {/* Header row — the dimension cell collapses on mobile, where the
                label sits above each row instead. */}
            <div className="hidden bg-[#0a0a0d] px-5 py-4 md:block">
              <span className="mono-label">Dimension</span>
            </div>
            <div className="bg-[#0a0a0d] px-5 py-4">
              <span className="flex items-center gap-1.5 font-mono text-[0.64rem] tracking-[0.1em] text-text-muted uppercase">
                <Minus className="size-3" /> Without Kairven
              </span>
            </div>
            <div className="bg-[#0a0a0d] px-5 py-4">
              <span className="flex items-center gap-1.5 font-mono text-[0.64rem] tracking-[0.1em] text-volt uppercase">
                <Plus className="size-3" /> With Kairven
              </span>
            </div>

            {COMPARISON.map((row, i) => (
              <Row key={row.dimension} row={row} index={i} />
            ))}
          </div>
        </div>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-2xl font-mono text-[0.7rem] leading-relaxed text-text-muted/70">
            Figures are aggregates from pilot deployments across dental, dermatology and home
            services in Uttar Pradesh and Maharashtra. Your baseline is measured in the first
            two weeks — before any automation ships.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function Row({row, index}: {row: (typeof COMPARISON)[number]; index: number}) {
  return (
    <>
      <div className="col-span-2 bg-[#0b0b0f] px-5 pt-4 pb-1 md:col-span-1 md:py-5">
        <p className="font-mono text-[0.62rem] tracking-[0.08em] text-text-muted/60 uppercase md:hidden">
          {String(index + 1).padStart(2, '0')}
        </p>
        <p className="text-[0.88rem] font-medium text-text-primary">{row.dimension}</p>
      </div>
      <div className="bg-[#0b0b0f] px-5 py-4 md:py-5">
        <p className="text-[0.84rem] leading-snug text-text-muted/75 line-through decoration-white/15">
          {row.before}
        </p>
      </div>
      <div className="relative bg-[#0b0b0f] px-5 py-4 md:py-5">
        <span
          className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-volt/35 to-transparent"
          aria-hidden="true"
        />
        <p className="flex items-start gap-2 text-[0.84rem] leading-snug text-text-primary">
          <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-volt/70" strokeWidth={2.4} />
          {row.after}
        </p>
      </div>
    </>
  )
}
