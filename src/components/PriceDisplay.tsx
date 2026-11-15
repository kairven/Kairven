import { useState } from "react"
import CountUp from "react-countup"
import * as ToggleGroup from "@radix-ui/react-toggle-group"
import { cn } from "@/lib/utils"

interface PriceDisplayProps {
  inr: number
  usd: number
  /** Shown under the price. */
  label?: string
  className?: string
}

const OPTIONS = ["INR", "USD"] as const
type Currency = (typeof OPTIONS)[number]

export function PriceDisplay({ inr, usd, label, className }: PriceDisplayProps) {
  const [currency, setCurrency] = useState<Currency>("INR")

  const value = currency === "INR" ? inr : usd
  const prefix = currency === "INR" ? "₹" : "$"

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
          {/*
            `key={currency}` is the load-bearing detail. CountUp's own
            `preserveValue` keeps the previously rendered number on screen, but
            it still re-mounts its internal counter when `end` changes unless the
            component is keyed — and `duration` alone won't re-run on a value
            swap. Keying by currency forces a fresh instance that animates from
            the last displayed figure to the new one, which is the transition you
            actually want to see on a toggle.
          */}
          <CountUp
            key={currency}
            end={value}
            duration={0.6}
            prefix={prefix}
            separator=","
            preserveValue
            useEasing
          />
        </span>
        <span className="font-mono text-[10px] tracking-widest text-muted uppercase">
          {currency}
        </span>
      </div>

      <ToggleGroup.Root
        type="single"
        value={currency}
        onValueChange={(v) => v && setCurrency(v as Currency)}
        aria-label="Select currency"
        className="inline-flex w-fit gap-1 rounded-full border border-hairline bg-carbon p-1"
      >
        {/* Radix ToggleGroup takes children — there is no `options` prop, and
            passing one silently renders an empty group. */}
        {OPTIONS.map((c) => (
          <ToggleGroup.Item
            key={c}
            value={c}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-[11px] tracking-wider transition-colors",
              "text-muted hover:text-primary",
              "data-[state=on]:bg-volt data-[state=on]:text-void"
            )}
          >
            {c}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>

      {label && <p className="telemetry-tag">{label}</p>}
    </div>
  )
}
