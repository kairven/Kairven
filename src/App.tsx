import {lazy, Suspense, useEffect} from 'react'
import {ScrollTrigger} from '@/lib/gsap.config'
import {destroySmoothScroll, initSmoothScroll} from '@/lib/smoothScroll'
import {Navbar} from './components/Navbar'
import {Hero} from './components/Hero'
import {TrustStrip} from './components/TrustStrip'
import {SignalSystem} from './components/SignalSystem'
import {SandboxDemo} from './components/SandboxDemo'
import {AuditModal} from './components/AuditModal'
import {ScrollProgress} from './components/ScrollProgress'
import {Faq} from './components/Faq'
import {PLACEHOLDER_DATA_IS_REAL} from '@/data/content'

// Below-the-fold sections are code-split: none of this is needed for first
// paint, and keeping it out of the initial bundle is most of the LCP win.
const Architecture = lazy(() =>
  import('./components/Architecture').then((m) => ({default: m.Architecture})),
)
const Comparison = lazy(() =>
  import('./components/Comparison').then((m) => ({default: m.Comparison})),
)
const Pricing = lazy(() => import('./components/Pricing').then((m) => ({default: m.Pricing})))
const Origin = lazy(() => import('./components/Origin').then((m) => ({default: m.Origin})))
const FinalCta = lazy(() =>
  import('./components/FinalCta').then((m) => ({default: m.FinalCta})),
)
const Footer = lazy(() => import('./components/Footer').then((m) => ({default: m.Footer})))

function SectionFallback({height = '60vh'}: {height?: string}) {
  return <div style={{minHeight: height}} aria-hidden="true" />
}

export default function App() {
  useEffect(() => {
    // Exactly one Lenis instance, one ticker. Nothing else may create a loop.
    initSmoothScroll()

    // Sections below the fold shift the document height after hydration;
    // refresh once the browser is idle so pinned triggers measure correctly.
    const refresh = () => ScrollTrigger.refresh()
    const id = window.setTimeout(refresh, 400)
    window.addEventListener('load', refresh)

    return () => {
      window.clearTimeout(id)
      window.removeEventListener('load', refresh)
      destroySmoothScroll()
    }
  }, [])

  if (!PLACEHOLDER_DATA_IS_REAL && import.meta.env.DEV) {
    // Loud on purpose: testimonial + metric placeholders must not reach prod.
    console.warn(
      '[Kairven] Placeholder marketing data is still in place. See src/data/content.ts.',
    )
  }

  return (
    <>
      <a
        href="#system"
        className="sr-only rounded-md bg-volt px-4 py-2 text-sm font-medium text-[#07080a] focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]"
      >
        Skip to content
      </a>

      <div className="noise-overlay" aria-hidden="true" />
      <ScrollProgress />
      <Navbar />

      <main>
        <Hero />
        <TrustStrip />
        <SignalSystem />

        <Suspense fallback={<SectionFallback />}>
          <SandboxDemo />
        </Suspense>

        <Suspense fallback={<SectionFallback height="80vh" />}>
          <Architecture />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <Comparison />
        </Suspense>

        <Suspense fallback={<SectionFallback height="80vh" />}>
          <Pricing />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <Origin />
        </Suspense>

        <Faq />

        <Suspense fallback={<SectionFallback />}>
          <FinalCta />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      <AuditModal />
    </>
  )
}
