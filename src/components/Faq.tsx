import { useState } from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Questions must stay in sync with the FAQPage JSON-LD in index.html.
 * Marking up answers that don't exist on the page is a spam violation, so this
 * list and that script are one artefact that happens to live in two places.
 */
const FAQS = [
  {
    q: "What does Kairven actually build?",
    a: "Three things that share one pipeline: an AI front desk that answers enquiries 24/7, local search visibility so the business is found, and a CRM pipeline that routes every lead somewhere it will be followed up.",
  },
  {
    q: "Which businesses is this for?",
    a: "Clinics, home services and local businesses in India that lose enquiries to slow or missed replies. If you answer every message within minutes, you do not need this.",
  },
  {
    q: "How long does setup take?",
    a: "Typically two to three weeks from kickoff, covering the WhatsApp and form intake, the knowledge base for automated replies, and the CRM handoff. Search visibility work runs longer because it depends on indexing.",
  },
  {
    q: "Do you replace my existing CRM?",
    a: "No. Kairven routes into the CRM you already use. If there isn't one, a lightweight pipeline is set up as part of the engagement.",
  },
]

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section aria-labelledby="faq-heading" className="mx-auto max-w-3xl px-6 pb-24">
      <p className="telemetry-tag">FAQ</p>
      <h2 id="faq-heading" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        Questions we get first
      </h2>

      <dl className="mt-8 divide-y divide-[var(--hairline)] border-y border-hairline">
        {FAQS.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={item.q} className="group">
              <dt>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-volt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt focus-visible:ring-offset-4 focus-visible:ring-offset-void"
                >
                  <span className="text-sm font-medium sm:text-base">{item.q}</span>
                  <Plus
                    className={cn(
                      "size-4 shrink-0 text-muted transition-transform duration-300",
                      isOpen && "rotate-45 text-volt"
                    )}
                    aria-hidden="true"
                  />
                </button>
              </dt>
              {/*
                Always rendered, height-animated via grid-rows. Keeping the text
                in the DOM means crawlers and answer engines see the full answer
                even when collapsed — display:none would hide it from AEO
                extraction, which defeats the point of the schema.
              */}
              <dd
                id={`faq-panel-${i}`}
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-[var(--ease-precision)]",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <p className="pb-5 pr-10 text-sm leading-relaxed text-muted">{item.a}</p>
                </div>
              </dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}
