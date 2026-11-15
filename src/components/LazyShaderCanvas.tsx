import { Suspense, lazy, useEffect, useRef, useState } from "react"

const ShaderCanvas = lazy(() => import("./ShaderCanvas"))

interface Props {
  className?: string
}

/**
 * Defers the renderer until the hero is actually on screen, and only then
 * pulls the OGL chunk.
 *
 * Two-stage on purpose: the dynamic import keeps OGL out of the initial
 * bundle (it's the single heaviest thing the page loads), and the viewport
 * gate means a visitor who lands scrolled down, or whose browser tabs away
 * mid-load, never pays for it at all.
 */
export default function LazyShaderCanvas({ className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    // Respect reduced motion before doing any work at all.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true)
          io.disconnect()
        }
      },
      { rootMargin: "200px" }
    )
    io.observe(host)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      {show && (
        <Suspense fallback={null}>
          <ShaderCanvas className="h-full w-full" />
        </Suspense>
      )}
    </div>
  )
}
