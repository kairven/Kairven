import SignalPath, { type SignalNode } from "./SignalPath"
import WhatsAppSandbox from "./WhatsAppSandbox"
import { PriceDisplay } from "./PriceDisplay"

const nodes: SignalNode[] = [
  { label: "Intake", metric: "form" },
  { label: "Enrich", metric: "crm" },
  { label: "Route", metric: "wa" },
  { label: "Close", metric: "<2h" },
]

export default function Modules() {
  return (
    <section aria-label="Interactive modules" className="mx-auto max-w-6xl px-6 pb-24">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="telemetry-tag">Interactive modules</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Three patterns, wired end to end
          </h2>
        </div>
        <p className="max-w-xs text-xs text-muted">
          Signal path, scripted intake, and a currency toggle that animates between
          values instead of resetting.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 4a */}
        <div className="card-hairline p-6 lg:col-span-2">
          <p className="telemetry-tag">4a — signal path</p>
          <p className="mt-1 text-xs text-muted">
            Each node owns its observer, so the cascade survives a fast scroll.
          </p>
          <SignalPath nodes={nodes} stagger={150} className="mt-6" />
        </div>

        {/* 4c */}
        <div className="card-hairline flex flex-col justify-center p-6">
          <p className="telemetry-tag">4c — pricing</p>
          <p className="mt-1 text-xs text-muted">
            Conversion at a fixed rate, so the two currencies never disagree.
          </p>
          <PriceDisplay inr={149000} usd={1790} label="per engagement" className="mt-6" />
        </div>

        {/* 4b */}
        <div className="lg:col-span-2">
          <WhatsAppSandbox />
        </div>

        <div className="card-hairline flex flex-col justify-between gap-6 p-6">
          <div>
            <p className="telemetry-tag">4b — why scripted</p>
            <p className="mt-3 text-sm leading-relaxed text-primary/70">
              A live WhatsApp sandbox on a public page means an API credential in
              reach of every visitor, rate limits you don't control, and a support
              inbox full of bot traffic — for a demo that converts no better than a
              convincing script.
            </p>
          </div>
          <p className="font-mono text-[10px] leading-relaxed text-muted">
            SCRIPT.length = 4 · no network · replays on re-entry
          </p>
        </div>
      </div>
    </section>
  )
}
