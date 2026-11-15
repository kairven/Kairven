import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap, ScrollTrigger } from "@/lib/smoothScroll"
import { cn } from "@/lib/utils"

const panels = [
  {
    index: "01",
    title: "Shaders",
    body: "Domain-warped fbm noise on a single triangle. No scene graph, no loaders — 2 KB of GLSL.",
  },
  {
    index: "02",
    title: "Motion",
    body: "One clock. Lenis feeds gsap.ticker, so scroll smoothing and every tween agree on the frame.",
  },
  {
    index: "03",
    title: "Types",
    body: "Strict TypeScript end to end, with primitive components driven by variants rather than props soup.",
  },
  {
    index: "04",
    title: "Tokens",
    body: "Tailwind v4 CSS-first theme. Three colour tokens, no config file, no build-time surprises.",
  },
]

export default function HorizontalPanels() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const wrapper = wrapperRef.current
      const track = trackRef.current
      if (!wrapper || !track) return

      // Distance the track must travel. Clamped at 0: if the panels are
      // narrower than the viewport (short content, zoomed-in browser), the
      // naive subtraction goes negative, which makes `end` resolve before
      // `start` and leaves ScrollTrigger in a permanently "finished" state.
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)

      const mm = gsap.matchMedia()

      // Desktop + motion-allowed only. Below 768px the panels fall back to
      // native horizontal scroll with snap points (see the clipper's classes),
      // which is far kinder on touch than a pinned hijack.
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        // Global selector would sweep in any `.h-panel` on the page. The
        // second arg scopes it to this section — gsap.utils.toArray does NOT
        // inherit the context scope the way gsap.to() selector strings do.
        const sections = gsap.utils.toArray<HTMLElement>(".h-panel", wrapper)

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1, // stops the jump as the pin engages mid-scroll
            invalidateOnRefresh: true, // recalculates on resize — don't skip this
          },
        })

        // Optional flourish: fade each panel's content in as it slides in.
        // `containerAnimation` is what makes triggers measure along the
        // horizontal axis instead of the vertical one.
        sections.forEach((panel, i) => {
          gsap.from(panel.querySelector("[data-panel-inner]"), {
            y: 32,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            delay: i * 0.02,
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: "left 92%",
              end: "left 55%",
              scrub: true,
            },
          })
        })

        return () => {
          // matchMedia reverts tweens/triggers created in this branch when it
          // stops matching, e.g. resizing down to mobile.
          tween.scrollTrigger?.kill()
          tween.kill()
        }
      })

      // Panel widths depend on font metrics; re-measure once webfonts land.
      document.fonts?.ready.then(() => ScrollTrigger.refresh())

      return () => mm.revert()
    },
    { scope: wrapperRef }
  )

  return (
    <section
      ref={wrapperRef}
      aria-label="Capabilities"
      className="relative h-svh w-full overflow-hidden bg-void"
    >
      {/*
        Clipper is a separate absolutely-positioned box so nothing overflows
        the page. Pin-spacing and `position: fixed` pinning both break if an
        ancestor has `overflow: hidden` or a transform — keeping the clip one
        level down from the pinned element avoids that trap.
      */}
      <div
        className={cn(
          "absolute inset-0 overflow-x-auto overflow-y-hidden md:overflow-hidden",
          "snap-x snap-mandatory md:snap-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        <div ref={trackRef} className="flex h-full w-max will-change-transform">
          {panels.map((p) => (
            <article
              key={p.index}
              className="h-panel flex w-screen shrink-0 snap-center items-center border-l border-hairline px-6 first:border-l-0 md:px-16"
            >
              <div data-panel-inner className="max-w-lg">
                <span className="telemetry-tag">
                  {p.index}
                </span>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
                  {p.title}
                </h2>
                <p className="mt-4 max-w-md text-sm text-primary/50 sm:text-base">{p.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex items-center justify-center gap-2 telemetry-tag opacity-60">
        <span className="hidden md:inline">Scroll</span>
        <span className="h-px w-10 bg-hairline" />
      </div>
    </section>
  )
}
