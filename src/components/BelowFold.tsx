import { Suspense, lazy } from "react"
import CountUp from "react-countup"
import { Minus, Plus } from "lucide-react"
import * as ToggleGroup from "@radix-ui/react-toggle-group"
import { Button } from "@/components/Button"
import { useStore } from "@/store/useStore"
import { cn } from "@/lib/utils"

const Modules = lazy(() => import("@/components/Modules"))
const Faq = lazy(() => import("@/components/Faq"))

const stats = [
  { value: 128, suffix: "+", label: "Shipped interfaces" },
  { value: 60, suffix: "fps", label: "Motion budget" },
  { value: 98, suffix: "", label: "Lighthouse score" },
]

const pills = ["WebGL", "GSAP", "TypeScript", "Tailwind v4"]

/**
 * Everything below the horizontal panels, isolated so the hero-critical path
 * never ships Radix ToggleGroup, CountUp or the module code. This whole chunk
 * is dynamically imported by App.
 */
export default function BelowFold({
  filter,
  setFilter,
}: {
  filter: string
  setFilter: (v: string) => void
}) {
  const { count, increment, decrement } = useStore()

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div data-reveal className="flex flex-wrap items-center justify-between gap-6">
          <p className="max-w-sm text-sm text-primary/50">
            Every layer is swappable — drop in your own shader, easing curve or data source.
          </p>
          <ToggleGroup.Root
            type="single"
            value={filter}
            onValueChange={(v) => v && setFilter(v)}
            className="flex flex-wrap gap-1 rounded-full border border-hairline p-1"
          >
            {pills.map((p) => (
              <ToggleGroup.Item
                key={p}
                value={p.toLowerCase()}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-medium text-primary/60 transition",
                  "data-[state=on]:bg-volt data-[state=on]:text-void hover:text-primary"
                )}
              >
                {p}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>
      </section>

      <section id="stats" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-hairline sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} data-reveal className="bg-void p-8">
              <div className="text-4xl font-semibold tracking-tight">
                <CountUp end={s.value} duration={2.2} decimals={0} />
                <span className="text-volt">{s.suffix}</span>
              </div>
              <p className="mt-2 text-sm text-primary/50">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <Suspense fallback={<div className="h-96" />}>
        <Modules />
      </Suspense>

      <section className="mx-auto max-w-6xl px-6 pb-32">
        <div
          data-reveal
          className="card-hairline flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center"
        >
          <div>
            <h2 className="text-xl font-semibold">Shared state, one store</h2>
            <p className="mt-1 text-sm text-primary/50">
              Zustand keeps cross-section state tiny and predictable.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={decrement} aria-label="Decrease">
              <Minus className="size-4" />
            </Button>
            <span className="w-12 text-center font-mono text-2xl tabular-nums">{count}</span>
            <Button size="sm" onClick={increment} aria-label="Increase">
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <Faq />
      </Suspense>
    </>
  )
}
