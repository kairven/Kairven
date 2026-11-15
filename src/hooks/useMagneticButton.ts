import { useEffect } from "react"
import { gsap } from "@/lib/smoothScroll"

interface MagneticOptions {
  /** How far the element can travel, as a fraction of the cursor offset. */
  strength?: number
}

/**
 * Pulls an element toward the cursor on hover. Pointer-fine devices only —
 * on touch, a magnetic button just feels like a dead tap target.
 *
 * Uses gsap.quickTo, which reuses a single tween per property instead of
 * creating a new one per mousemove. That's the whole point: at 120Hz with a
 * plain gsap.to you'd spawn ~120 tweens a second.
 */
export function useMagneticButton(
  ref: React.RefObject<HTMLElement | null>,
  { strength = 0.35 }: MagneticOptions = {}
) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Guard on both hover capability and user motion preference.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    gsap.set(el, { willChange: "transform" })

    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" })
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" })

    const move = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect()
      xTo((e.clientX - left - width / 2) * strength)
      yTo((e.clientY - top - height / 2) * strength)
    }

    const leave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener("mousemove", move)
    el.addEventListener("mouseleave", leave)

    return () => {
      el.removeEventListener("mousemove", move)
      el.removeEventListener("mouseleave", leave)
      // quickTo tweens are long-lived; without this they keep running
      // (and keep a reference to the detached node) after unmount.
      gsap.killTweensOf(el)
      gsap.set(el, { clearProps: "transform,willChange" })
    }
  }, [ref, strength])
}
