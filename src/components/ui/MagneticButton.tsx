import {useEffect, useRef, type ReactNode} from 'react'
import {gsap} from '@/lib/gsap.config'
import {cn} from '@/lib/cn'

type Props = {
  children: ReactNode
  className?: string
  /** 0 = perfectly stiff, 1 = very loose. 0.35 matches the spec. */
  strength?: number
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  'aria-label'?: string
  title?: string
}

/**
 * Magnetic hover driven by gsap.quickTo.
 *
 * quickTo keeps a single tween alive and just retargets its end value, so a
 * mousemove never allocates a tween and never touches React state. Guarded on
 * `(hover: hover)` so touch devices don't pay for the listeners at all.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.35,
  href,
  onClick,
  type = 'button',
  disabled,
  ...rest
}: Props) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const xTo = gsap.quickTo(el, 'x', {duration: 0.4, ease: 'power3'})
    const yTo = gsap.quickTo(el, 'y', {duration: 0.4, ease: 'power3'})

    const move = (e: MouseEvent) => {
      const {left, top, width, height} = el.getBoundingClientRect()
      xTo((e.clientX - left - width / 2) * strength)
      yTo((e.clientY - top - height / 2) * strength)
    }
    const leave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', leave)
      gsap.killTweensOf(el)
    }
  }, [strength])

  const shared = {
    ref: ref as React.RefObject<never>,
    className: cn('inline-flex items-center justify-center will-transform', className),
    onClick,
    ...rest,
  }

  if (href) {
    return (
      <a {...shared} href={href}>
        {children}
      </a>
    )
  }

  return (
    <button {...shared} type={type} disabled={disabled}>
      {children}
    </button>
  )
}

/** Diagonal shine that tracks the pointer across cards. Cheap, CSS-only. */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(hover: hover)').matches) return

    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    el.addEventListener('mousemove', move)
    return () => el.removeEventListener('mousemove', move)
  }, [])

  return ref
}
