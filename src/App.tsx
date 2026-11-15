import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import CountUp from "react-countup"
import * as Dialog from "@radix-ui/react-dialog"
import * as ToggleGroup from "@radix-ui/react-toggle-group"
import { ArrowUpRight, Minus, Plus, X } from "lucide-react"
import { useSmoothScroll } from "@/hooks/useSmoothScroll"
import { gsap, ScrollTrigger } from "@/lib/smoothScroll"
import { useMagneticButton } from "@/hooks/useMagneticButton"
import ShaderCanvas from "@/components/ShaderCanvas"
import HorizontalPanels from "@/components/HorizontalPanels"
import Modules from "@/components/Modules"
import { routeToWhatsApp } from "@/lib/waRoute"
import { Button } from "@/components/Button"
import { useStore } from "@/store/useStore"
import { cn } from "@/lib/utils"

/**
 * Wraps a Button so the magnetic transform lands on an outer div, not the
 * <button> itself. Keeping transform off the button preserves its hit area and
 * avoids fighting focus rings / press states.
 */
function Magnetic({
  children,
  strength = 0.35,
}: {
  children: React.ReactNode
  strength?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useMagneticButton(ref, { strength })
  return (
    <div ref={ref} className="inline-block">
      {children}
    </div>
  )
}

const stats = [
  { value: 128, suffix: "+", label: "Shipped interfaces" },
  { value: 60, suffix: "fps", label: "Motion budget" },
  { value: 98, suffix: "", label: "Lighthouse score" },
]

const pills = ["WebGL", "GSAP", "TypeScript", "Tailwind v4"]

export default function App() {
  useSmoothScroll()
  const reduce = useReducedMotion()
  const { count, increment, decrement } = useStore()
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        })
      })
    })
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [])

  return (
    <div className="mesh-bg relative min-h-svh text-primary antialiased">
      {/* grain — sits above the page, below modals (z-50) */}
      <div className="noise-overlay" aria-hidden="true" />
      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="#" className="text-sm font-semibold tracking-[0.2em] uppercase">
            Kairven
          </a>
          <nav className="hidden items-center gap-1 md:flex">
            {["Work", "Studio", "Journal"].map((item) => (
              <a
                key={item}
                href="#"
                className="rounded-full px-4 py-2 text-sm text-primary/60 transition hover:bg-white/5 hover:text-primary"
              >
                {item}
              </a>
            ))}
          </nav>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <Button size="sm">Start a project</Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
              <Dialog.Content className="glass-panel fixed left-1/2 top-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-card)] p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <Dialog.Title className="text-lg font-semibold">Start a project</Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-primary/60">
                      Tell us where you're headed. We reply within two working days.
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      aria-label="Close"
                      className="rounded-full p-2 text-primary/60 transition hover:bg-white/10 hover:text-primary"
                    >
                      <X className="size-4" />
                    </button>
                  </Dialog.Close>
                </div>
                <form
                  className="mt-6 space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const data = new FormData(e.currentTarget)
                    setSending(true)
                    setFormError(null)
                    try {
                      // The number lives only in the serverless function's env.
                      await routeToWhatsApp({
                        name: String(data.get("name") ?? ""),
                        business: String(data.get("business") ?? ""),
                        painPoint: String(data.get("painPoint") ?? ""),
                      })
                      setOpen(false)
                    } catch {
                      // Opening wa.me directly is a reasonable fallback, but the
                      // number is deliberately not in the bundle — so surface the
                      // failure instead of inventing a destination.
                      setFormError("Couldn't open WhatsApp. Email hello@kairven.com instead.")
                    } finally {
                      setSending(false)
                    }
                  }}
                >
                  <input
                    name="name"
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    className="h-11 w-full rounded-lg border border-hairline bg-carbon px-3 text-sm outline-none focus:border-volt"
                  />
                  <input
                    name="business"
                    autoComplete="organization"
                    placeholder="Business (optional)"
                    className="h-11 w-full rounded-lg border border-hairline bg-carbon px-3 text-sm outline-none focus:border-volt"
                  />
                  <textarea
                    name="painPoint"
                    required
                    rows={3}
                    placeholder="What's the bottleneck?"
                    className="w-full resize-none rounded-lg border border-hairline bg-carbon p-3 text-sm outline-none focus:border-volt"
                  />
                  {formError && (
                    <p role="alert" className="text-xs text-gold">
                      {formError}
                    </p>
                  )}
                  <Button type="submit" className="w-full" disabled={sending}>
                    {sending ? "Opening WhatsApp…" : "Continue on WhatsApp"}
                  </Button>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6">
        <ShaderCanvas className="absolute inset-0 z-0 opacity-90" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-void/40 via-transparent to-void" />

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-3xl text-center"
        >
          <span className="telemetry-tag inline-flex items-center gap-2 rounded-full border border-hairline bg-carbon-raised/70 px-3 py-1 backdrop-blur">
            <span className="size-1.5 rounded-full bg-volt" />
            Core — v0.1
          </span>
          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
            Interfaces with a{" "}
            <span className="bg-gradient-to-r from-volt to-white bg-clip-text text-transparent">
              pulse
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-primary/60 sm:text-lg">
            A motion-first foundation: shaders, smooth scroll and typed components, wired
            together and ready to build on.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <Button size="lg" onClick={() => setOpen(true)}>
                Start a project <ArrowUpRight className="size-4" />
              </Button>
            </Magnetic>
            <Magnetic strength={0.2}>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See the numbers
              </Button>
            </Magnetic>
          </div>
        </motion.div>
      </section>

      {/* Horizontal pinned panels */}
      <HorizontalPanels />

      {/* Pills / toggle */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div data-reveal className="flex flex-wrap items-center justify-between gap-6">
          <p className="max-w-sm text-sm text-primary/50">
            Every layer is swappable — drop in your own shader, easing curve or data source.
          </p>
          <ToggleGroup.Root
            type="single"
            value={filter}
            onValueChange={(v) => v && setFilter(v)}
            className="flex flex-wrap gap-1 rounded-full border border-white/10 p-1"
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

      {/* Stats */}
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

      {/* Interactive modules */}
      <Modules />

      {/* Zustand demo */}
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

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs text-primary/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Kairven</span>
          <span>Built with React 18 · Vite 5 · Tailwind 4 · OGL</span>
        </div>
      </footer>
    </div>
  )
}
