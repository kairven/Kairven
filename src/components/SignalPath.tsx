import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface SignalNode {
  label: string
  /** Short telemetry readout shown under the node. */
  metric: string
}

interface SignalPathProps {
  nodes: SignalNode[]
  /** Stagger between each node's reveal. */
  stagger?: number
  className?: string
}

/**
 * Animated SVG signal path with per-node IntersectionObservers.
 *
 * Each node owns its own observer and its own stagger. The alternative — one
 * shared trigger animating all four paths — fires them simultaneously on a
 * fast scroll, because ScrollTrigger/IO resolves the whole group in a single
 * callback. Separate observers keep the cascade intact regardless of velocity.
 */
export default function SignalPath({ nodes, stagger = 150, className }: SignalPathProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const paths = Array.from(root.querySelectorAll<SVGPathElement>("[data-signal-path]"))

    // Measure the real geometry. A hardcoded `stroke-dasharray: 300` only
    // works for a path that happens to be exactly 300 units long; anything
    // longer leaves a permanent gap, anything shorter draws extra dashes.
    paths.forEach((path) => {
      const len = path.getTotalLength()
      path.style.strokeDasharray = `${len}`
      path.style.strokeDashoffset = prefersReduced ? "0" : `${len}`
    })

    if (prefersReduced) {
      root.querySelectorAll<HTMLElement>("[data-signal-node]").forEach((n) =>
        n.classList.add("is-visible")
      )
      return
    }

    const timers: number[] = []
    const observers: IntersectionObserver[] = []

    paths.forEach((path, i) => {
      const node = path.closest<HTMLElement>("[data-signal-node]")
      const len = path.getTotalLength()

      const io = new IntersectionObserver(
        ([entry]) => {
          const delay = i * stagger

          if (entry.isIntersecting) {
            // Per-node timer, so the cascade is preserved even when several
            // observers report in the same frame.
            const t = window.setTimeout(() => {
              path.style.strokeDashoffset = "0"
              node?.classList.add("is-visible")
            }, delay)
            timers.push(t)
          } else {
            timers.forEach(clearTimeout)
            timers.length = 0
            // Reset only when it has scrolled fully past, so a node hovering at
            // the viewport edge doesn't flicker between states.
            path.style.strokeDashoffset = `${len}`
            node?.classList.remove("is-visible")
          }
        },
        { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }
      )

      io.observe(node ?? path)
      observers.push(io)
    })

    return () => {
      timers.forEach(clearTimeout)
      observers.forEach((o) => o.disconnect())
    }
  }, [stagger])

  const spacing = 100 / nodes.length

  return (
    <div ref={rootRef} className={cn("w-full", className)}>
      <div className="relative h-[180px] w-full sm:h-[220px]">
        <svg
          viewBox="0 0 1000 200"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="signal-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--volt)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--gold-telemetry)" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {nodes.map((_, i) => {
            const x1 = i * spacing * 10
            const x2 = (i + 1) * spacing * 10
            const midY = i % 2 === 0 ? 130 : 70

            return (
              // Each segment is its own path so it can stagger independently.
              <path
                key={i}
                data-signal-path
                d={
                  i === nodes.length - 1
                    ? ""
                    : `M ${x1} 100 C ${x1 + (x2 - x1) * 0.4} ${midY}, ${
                        x2 - (x2 - x1) * 0.4
                      } ${midY}, ${x2} 100`
                }
                fill="none"
                stroke="url(#signal-grad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
        </svg>

        {/* Nodes are DOM, not SVG, so labels stay real text at real sizes. */}
        <div className="absolute inset-0 flex items-center justify-between">
          {nodes.map((node, i) => (
            <div
              key={node.label}
              data-signal-node
              className={cn(
                "signal-node group relative flex flex-col items-center gap-3",
                i === 0 ? "items-start" : i === nodes.length - 1 ? "items-end" : ""
              )}
              style={{ "--node-delay": `${i * stagger}ms` } as React.CSSProperties}
            >
              <span className="signal-dot size-2.5 rounded-full border border-volt/60" />
              <span className="telemetry-tag whitespace-nowrap text-center">{node.label}</span>
              <span className="font-mono text-[10px] text-muted">{node.metric}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
