import {ArrowUpRight} from 'lucide-react'
import {NAV_LINKS} from '@/data/content'
import {scrollToId} from '@/lib/smoothScroll'
import {useAppStore} from '@/lib/store'
import {Logo} from './Navbar'

export function Footer() {
  const openAudit = useAppStore((s) => s.openAudit)
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-white/[0.07] bg-[#07070a]">
      <div className="shell py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo />
              <span className="text-[0.95rem] font-semibold tracking-[-0.02em] text-text-primary">
                Kairven
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[0.82rem] leading-relaxed text-text-muted">
              Autonomous digital infrastructure for clinics, home services and local businesses
              across India.
            </p>
            <button
              onClick={() => openAudit('footer')}
              className="group mt-6 inline-flex items-center gap-1.5 font-mono text-[0.68rem] tracking-[0.08em] text-volt uppercase"
            >
              Start a diagnostic
              <ArrowUpRight className="size-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2.5">
            <p className="mono-label mb-1 text-[0.6rem]">Navigate</p>
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollToId(l.id)}
                className="w-fit text-left text-[0.82rem] text-text-muted transition-colors hover:text-text-primary"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => scrollToId('faq')}
              className="w-fit text-left text-[0.82rem] text-text-muted transition-colors hover:text-text-primary"
            >
              FAQ
            </button>
          </nav>

          <div className="flex flex-col gap-2.5">
            <p className="mono-label mb-1 text-[0.6rem]">Contact</p>
            <a
              href="mailto:hello@kairven.com"
              className="w-fit text-[0.82rem] text-text-muted transition-colors hover:text-text-primary"
            >
              hello@kairven.com
            </a>
            <a
              href="https://kairven.com"
              className="w-fit text-[0.82rem] text-text-muted transition-colors hover:text-text-primary"
              rel="noopener"
            >
              kairven.com
            </a>
            <address className="mt-2 text-[0.78rem] leading-relaxed text-text-muted/70 not-italic">
              Kanpur, Uttar Pradesh
              <br />
              India 208001
            </address>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.06] pt-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[0.65rem] tracking-[0.04em] text-text-muted/60">
            © {year} Kairven · Mohammad Sameer Khan
          </p>
          <p className="font-mono text-[0.65rem] tracking-[0.04em] text-text-muted/45">
            Built in Kanpur · Deployed on the edge
          </p>
        </div>
      </div>
    </footer>
  )
}
