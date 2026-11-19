import {Plus} from 'lucide-react'
import {FAQS} from '@/data/content'
import {SectionHeading} from './ui/SectionHeading'
import {Reveal} from './ui/Reveal'
import {useSectionReveal} from '@/lib/useSectionReveal'

/**
 * Native <details>/<summary> — keyboard accessible, works without JS, and the
 * content is in the DOM for answer engines. The FAQPage JSON-LD in index.html
 * mirrors these exact strings.
 */
export function Faq() {
  const revealRef = useSectionReveal()
  return (
    <section
      ref={revealRef}
      id="faq"
      className="relative scroll-mt-20 border-t border-white/[0.06] py-24 md:py-32"
    >
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading
            index="07"
            label="Questions"
            title="Straight answers."
            lede="If yours isn’t here, the diagnostic form gets you a real reply — usually same day."
          />

          <div className="divide-y divide-white/[0.07] border-t border-white/[0.07]">
            {FAQS.map((item, i) => (
              <Reveal key={item.q} delay={i * 0.04}>
                <details className="group py-1">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-4 text-[0.95rem] font-medium text-text-primary transition-colors hover:text-volt [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <Plus
                      className="mt-0.5 size-4 shrink-0 text-text-muted transition-transform duration-300 group-open:rotate-45 group-open:text-volt"
                      strokeWidth={2}
                    />
                  </summary>
                  <p className="max-w-2xl pr-8 pb-5 text-[0.87rem] leading-relaxed text-text-muted">
                    {item.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
