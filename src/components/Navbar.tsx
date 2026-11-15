import {useEffect, useState} from 'react'
import {ArrowUpRight, Menu, X} from 'lucide-react'
import {NAV_LINKS} from '@/data/content'
import {useAppStore} from '@/lib/store'
import {scrollToId} from '@/lib/smoothScroll'
import {cn} from '@/lib/cn'
import {MagneticButton} from './ui/MagneticButton'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const openAudit = useAppStore((s) => s.openAudit)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, {passive: true})
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (id: string) => {
    setMobileOpen(false)
    // Let the mobile sheet finish collapsing before measuring the target.
    window.setTimeout(() => scrollToId(id), mobileOpen ? 220 : 0)
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled
            ? 'border-b border-white/[0.07] bg-[#050507]/72 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
        style={{transitionTimingFunction: 'var(--ease-precision)'}}
      >
        <div className="shell flex h-16 items-center justify-between gap-6">
          <button
            onClick={() => go('top')}
            className="group flex items-center gap-2.5"
            aria-label="Kairven — back to top"
          >
            <Logo />
            <span className="text-[0.98rem] font-semibold tracking-[-0.02em] text-text-primary">
              Kairven
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className="rounded-full px-3.5 py-2 text-[0.83rem] text-text-muted transition-colors duration-300 hover:text-text-primary"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <MagneticButton
              className="btn-volt hidden px-4 py-2.5 text-[0.8rem] sm:inline-flex"
              onClick={() => openAudit('navbar')}
              strength={0.22}
            >
              Free diagnostic
              <ArrowUpRight className="ml-1.5 size-3.5" strokeWidth={2.4} />
            </MagneticButton>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex size-10 items-center justify-center rounded-full border border-white/10 text-text-primary lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        id="mobile-nav"
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-[#050507]/92 backdrop-blur-2xl transition-opacity duration-[400ms]',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMobileOpen(false)}
        />
        <nav
          className={cn(
            'relative flex h-full flex-col justify-center gap-1 px-8 pt-16 transition-all duration-500',
            mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
          )}
          style={{transitionTimingFunction: 'var(--ease-precision)'}}
          aria-label="Mobile"
        >
          {NAV_LINKS.map((link, i) => (
            <button
              key={link.id}
              onClick={() => go(link.id)}
              className="flex items-baseline gap-4 border-b border-white/[0.06] py-4 text-left"
            >
              <span className="telemetry-tag tabular-nums">
                0{i + 1}
              </span>
              <span className="text-2xl font-medium tracking-[-0.02em] text-text-primary">
                {link.label}
              </span>
            </button>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false)
              openAudit('mobile-nav')
            }}
            className="btn-volt mt-8 inline-flex items-center justify-center px-5 py-3.5 text-sm"
          >
            Get the free diagnostic
            <ArrowUpRight className="ml-2 size-4" strokeWidth={2.4} />
          </button>
        </nav>
      </div>
    </>
  )
}

export function Logo({className}: {className?: string}) {
  return (
    <svg
      viewBox="0 0 28 28"
      className={cn('size-[22px]', className)}
      fill="none"
      aria-hidden="true"
    >
      <rect x="0.75" y="0.75" width="26.5" height="26.5" rx="7.5" stroke="rgba(255,255,255,0.16)" />
      <path d="M9 8.5v11" stroke="#D4FF00" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M19.2 8.5 12.1 15.2l7.3 6.3"
        stroke="#F5F5F2"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
