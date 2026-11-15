import {CountUpValue} from './ui/CountUpValue'

type Metric = {value: number; suffix: string; label: string; decimals: number}

/**
 * Hero entrance choreography (including this block) is a single timeline in
 * Hero.tsx targeting `.hero-in`. Here we only own the number counters.
 */
export function HeroMetrics({metrics}: {metrics: readonly Metric[]}) {
  return (
    <dl className="hero-in mt-14 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/[0.07] pt-7 md:grid-cols-4 md:gap-x-10">
      {metrics.map((m) => (
        <div key={m.label} className="min-w-0">
          <dd className="text-[1.55rem] font-medium tracking-[-0.03em] text-text-primary tabular-nums md:text-[1.8rem]">
            <CountUpValue
              value={m.value}
              suffix={m.suffix}
              decimals={m.decimals}
              duration={1.8}
            />
          </dd>
          <dt className="mt-1.5 text-[0.76rem] leading-snug text-text-muted">{m.label}</dt>
        </div>
      ))}
    </dl>
  )
}
