import * as ToggleGroup from '@radix-ui/react-toggle-group'
import {ArrowUpRight, Check, Sparkles} from 'lucide-react'
import {PRICING} from '@/data/content'
import {useAppStore, type Currency} from '@/lib/store'
import {cn} from '@/lib/cn'
import {SectionHeading} from './ui/SectionHeading'
import {Reveal} from './ui/Reveal'
import {CountUpValue} from './ui/CountUpValue'
import {MagneticButton} from './ui/MagneticButton'
import {useSectionReveal} from '@/lib/useSectionReveal'

export function Pricing() {
  const currency = useAppStore((s) => s.currency)
  const setCurrency = useAppStore((s) => s.setCurrency)
  const openAudit = useAppStore((s) => s.openAudit)
  const revealRef = useSectionReveal()

  return (
    <section ref={revealRef} id="pricing" className="relative scroll-mt-20 py-24 md:py-32">
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            index="05"
            label="Engagement"
            title={
              <>
                Priced like infrastructure,
                <br />
                <span className="text-text-muted">not like a retainer you forget.</span>
              </>
            }
            lede="Managed monthly. Setup covers integration, verification and the QA pass before anything touches a real customer."
          />

          <Reveal delay={0.1}>
            <CurrencyToggle value={currency} onChange={setCurrency} />
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {PRICING.map((plan, i) => {
            const value = currency === 'INR' ? plan.inr : plan.usd
            const prefix = currency === 'INR' ? '₹' : '$'
            return (
              <Reveal key={plan.id} delay={i * 0.08}>
                <article
                  className={cn(
                    'card-hairline card-spotlight relative flex h-full flex-col p-7 md:p-8',
                    plan.featured && 'bg-carbon-raised',
                  )}
                >
                  {plan.featured && (
                    <>
                      <span
                        className="pointer-events-none absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-volt/70 to-transparent"
                        aria-hidden="true"
                      />
                      <span className="absolute top-6 right-6 flex items-center gap-1 rounded-full border border-volt/25 bg-volt/[0.07] px-2.5 py-1 font-mono text-[0.58rem] tracking-[0.1em] text-volt uppercase">
                        <Sparkles className="size-2.5" strokeWidth={2.5} />
                        Most chosen
                      </span>
                    </>
                  )}

                  <h3 className="text-[1.15rem] font-medium tracking-[-0.02em] text-text-primary">
                    {plan.name}
                  </h3>
                  <p className="mt-1.5 max-w-[15rem] text-[0.82rem] leading-relaxed text-text-muted">
                    {plan.tagline}
                  </p>

                  <div className="mt-8 flex items-baseline gap-1.5">
                    <span className="text-[2.35rem] leading-none font-medium tracking-[-0.04em] text-text-primary tabular-nums">
                      <CountUpValue value={value} prefix={prefix} />
                    </span>
                    <span className="font-mono text-[0.72rem] text-text-muted">
                      {plan.cadence}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-[0.66rem] tracking-[0.04em] text-gold/80">
                    {plan.setup}
                  </p>

                  <div className="hairline-rule my-7" />

                  <ul className="flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check
                          className={cn(
                            'mt-0.5 size-3.5 shrink-0',
                            plan.featured ? 'text-volt' : 'text-text-muted',
                          )}
                          strokeWidth={2.6}
                        />
                        <span className="text-[0.83rem] leading-snug text-text-primary/85">
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <MagneticButton
                    className={cn(
                      'mt-8 w-full px-5 py-3 text-[0.84rem]',
                      plan.featured ? 'btn-volt' : 'btn-ghost',
                    )}
                    onClick={() => openAudit(`pricing:${plan.id}:${currency}`)}
                    strength={0.14}
                  >
                    {plan.featured ? 'Start with a diagnostic' : 'Talk to us'}
                    <ArrowUpRight className="ml-1.5 size-3.5" strokeWidth={2.4} />
                  </MagneticButton>
                </article>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 font-mono text-[0.68rem] tracking-[0.04em] text-text-muted/70">
            Monthly rolling after the first 90 days · cancel with 30 days notice · INR prices
            exclusive of 18% GST · USD indicative, billed at the prevailing rate
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/** 4c — INR/USD switch with an animated counter transition (not a jump). */
function CurrencyToggle({
  value,
  onChange,
}: {
  value: Currency
  onChange: (v: Currency) => void
}) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as Currency)}
      aria-label="Display currency"
      className="relative inline-flex items-center gap-0.5 rounded-full border border-white/[0.09] bg-carbon p-1"
    >
      {(['INR', 'USD'] as const).map((c) => (
        <ToggleGroup.Item
          key={c}
          value={c}
          className={cn(
            'relative rounded-full px-4 py-1.5 font-mono text-[0.7rem] tracking-[0.06em] transition-all duration-300',
            value === c
              ? 'bg-volt text-[#07080a] shadow-[0_0_20px_-6px_rgba(212,255,0,0.7)]'
              : 'text-text-muted hover:text-text-primary',
          )}
          style={{transitionTimingFunction: 'var(--ease-precision)'}}
        >
          {c}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
