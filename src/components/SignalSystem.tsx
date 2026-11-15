import {useEffect, useRef} from 'react'
import {SIGNAL_STAGES} from '@/data/content'
import {SectionHeading} from './ui/SectionHeading'
import {Reveal} from './ui/Reveal'

/**
 * 4a — animated SVG signal path.
 *
 * Each node gets its own IntersectionObserver and its own cascading delay
 * (150ms * index), NOT one shared trigger. A single trigger makes all four
 * paths fire simultaneously on a fast scroll, which reads as a glitch.
 */
export function SignalSystem() {
  const scope = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = scope.current
    if (!root) return

    const nodes = Array.from(root.querySelectorAll<SVGElement>('[data-signal]'))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      nodes.forEach((n) => n.classList.add('in-view'))
      return
    }

    const observers: IntersectionObserver[] = []
    let timers: number[] = []

    nodes.forEach((node) => {
      const index = Number(node.dataset.index ?? 0)
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            const t = window.setTimeout(() => {
              node.classList.add('in-view')
            }, index * 150)
            timers.push(t)
            io.unobserve(entry.target)
          })
        },
        {threshold: 0.35, rootMargin: '0px 0px -8% 0px'},
      )
      io.observe(node)
      observers.push(io)
    })

    return () => {
      observers.forEach((o) => o.disconnect())
      timers.forEach((t) => window.clearTimeout(t))
      timers = []
    }
  }, [])

  return (
    <section id="system" className="relative scroll-mt-20 py-24 md:py-32">
      <div className="shell">
        <SectionHeading
          index="01"
          label="The system"
          title={
            <>
              Four stages between{' '}
              <span className="text-gold">“I need this”</span> and{' '}
              <span className="text-text-primary">“it’s booked”</span>.
            </>
          }
          lede="Most local businesses lose the sale inside the first hour, not at the pitch. Kairven closes that gap with a single signal path — inspectable at every hop, not a black box with a chat bubble stapled on."
        />

        <div ref={scope} className="mt-16">
          {/* Desktop: horizontal path. Mobile: vertical rail. */}
          <div className="relative">
            <SignalRail />

            <ol className="relative mt-10 grid gap-4 md:mt-12 md:grid-cols-4 md:gap-5">
              {SIGNAL_STAGES.map((stage, i) => (
                <li key={stage.id}>
                  <Reveal delay={i * 0.07}>
                    <article className="card-hairline group h-full p-5 transition-colors duration-500 hover:bg-carbon-raised/70 md:p-6">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="telemetry-tag">{stage.index}</span>
                        <span className="font-mono text-[0.66rem] tracking-[0.06em] text-text-muted/70 uppercase">
                          {stage.metric}
                        </span>
                      </div>
                      <h3 className="mt-8 text-[1.15rem] font-medium tracking-[-0.02em] text-text-primary">
                        {stage.title}
                      </h3>
                      <p className="mt-2.5 text-[0.86rem] leading-relaxed text-text-muted">
                        {stage.blurb}
                      </p>
                    </article>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * The drawn path itself. viewBox is 0..1000 wide; stage centres sit at
 * 12.5 / 37.5 / 62.5 / 87.5 so the node dots line up with the 4-col grid.
 */
function SignalRail() {
  const centers = [125, 375, 625, 875]

  return (
    <div className="relative h-14 w-full" aria-hidden="true">
      <svg
        viewBox="0 0 1000 56"
        className="h-full w-full"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="sig-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4FF00" stopOpacity="0.15" />
            <stop offset="45%" stopColor="#D4FF00" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E2A856" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="sig-base" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.03" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Dormant rail */}
        <line x1="20" y1="28" x2="980" y2="28" stroke="url(#sig-base)" strokeWidth="1" />

        {/* Four segments, each owning its own observer + 150ms cascade */}
        {centers.map((c, i) => {
          const from = i === 0 ? 20 : centers[i - 1] + 34
          const to = i === centers.length - 1 ? 980 : c + 34
          return (
            <line
              key={c}
              data-signal
              data-index={i}
              className="signal-path"
              x1={from}
              y1="28"
              x2={to}
              y2="28"
              stroke="url(#sig-grad)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          )
        })}

        {centers.map((c, i) => (
          <g key={`node-${c}`} data-signal data-index={i} className="signal-node">
            <circle cx={c} cy="28" r="9" fill="#D4FF00" fillOpacity="0.08" />
            <circle cx={c} cy="28" r="4" fill="#D4FF00" />
            <circle cx={c} cy="28" r="4" stroke="#D4FF00" strokeOpacity="0.5" strokeWidth="6" />
          </g>
        ))}
      </svg>
    </div>
  )
}
