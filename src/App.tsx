import { Suspense, lazy, useEffect, useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { ArrowUpRight, X } from "lucide-react"
import { useSmoothScroll } from "@/hooks/useSmoothScroll"
import { gsap, ScrollTrigger } from "@/lib/smoothScroll"
import { useMagneticButton } from "@/hooks/useMagneticButton"
import LazyShaderCanvas from "@/components/LazyShaderCanvas"
/*
  Below-the-fold sections are split out of the initial bundle. On a cold mobile
  load this is the difference between shipping the hero and shipping the whole
  page before first paint; React resolves each chunk as it scrolls into range.
*/
const HorizontalPanels = lazy(() => import("@/components/HorizontalPanels"))
const BelowFold = lazy(() => import("@/components/BelowFold"))
import { routeToWhatsApp } from "@/lib/waRoute"
import { Button } from "@/components/Button"

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

export default function App() {
  useSmoothScroll()
  // Hero reveal is a GSAP tween rather than Framer Motion: one fade-in did not
  // justify a 104 KB runtime. GSAP is already loaded for ScrollTrigger here.
  const heroRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    // Hero reveal — respects reduced motion by simply not setting a from-state.
    const hero = heroRef.current
    if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.from(hero, {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: "power3.out",
        // clearProps so no residual transform survives to trap position:fixed children
        clearProps: "transform,opacity",
      })
    }
  }, [])

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
        <LazyShaderCanvas className="absolute inset-0 z-0 opacity-90" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-void/40 via-transparent to-void" />

        <div ref={heroRef} className="relative z-10 max-w-3xl text-center">
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
        </div>
      </section>

      {/* Horizontal pinned panels */}
      <Suspense fallback={<div className="h-svh" />}>
        <HorizontalPanels />
      </Suspense>

      <Suspense fallback={<div className="h-[600px]" />}>
        <BelowFold filter={filter} setFilter={setFilter} />
      </Suspense>

      <footer className="border-t border-hairline px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs text-primary/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Kairven</span>
          <span>Built with React 18 · Vite 5 · Tailwind 4 · OGL</span>
        </div>
      </footer>
    </div>
  )
}
