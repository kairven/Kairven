import { useCallback, useEffect, useRef, useState } from "react"
import { Check, CheckCheck, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

type Message = { from: "customer" | "kairven"; text: string; delay: number }

/**
 * Deliberately a *script* — no network, no WhatsApp API, no credentials.
 * A real integration on a public marketing page is an abuse vector and a
 * support burden with no conversion upside. The timer illusion is the product.
 *
 * `delay` is the gap AFTER the previous message, which is why the first entry
 * is 0. Storing absolute timings instead makes editing the script error-prone.
 */
const SCRIPT: Message[] = [
  { from: "customer", text: "Hi, do you have availability tomorrow?", delay: 0 },
  { from: "kairven", text: "Yes — 10 AM, 2 PM or 4 PM work. Which suits you?", delay: 1200 },
  { from: "customer", text: "2 PM please", delay: 2400 },
  { from: "kairven", text: "Booked! Confirmation sent. ✅", delay: 1200 },
]

const TYPING_MS = 700

export default function WhatsAppSandbox() {
  const rootRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const [visible, setVisible] = useState(0)
  const [typing, setTyping] = useState(false)
  const [started, setStarted] = useState(false)

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const reset = useCallback(() => {
    clearAll()
    setVisible(0)
    setTyping(false)
  }, [clearAll])

  const play = useCallback(() => {
    clearAll()
    setVisible(0)
    setTyping(false)

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // No theatre — reveal the whole thread immediately.
      setVisible(SCRIPT.length)
      return
    }

    let elapsed = 0
    SCRIPT.forEach((msg, i) => {
      elapsed += msg.delay
      if (msg.from === "kairven") {
        // Show "typing…" shortly before the reply lands, then clear it.
        const startTimer = window.setTimeout(() => setTyping(true), Math.max(0, elapsed - TYPING_MS))
        const endTimer = window.setTimeout(() => setTyping(false), elapsed)
        timers.current.push(startTimer, endTimer)
      }
      const t = window.setTimeout(() => setVisible(i + 1), elapsed)
      timers.current.push(t)
    })
  }, [clearAll])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          play()
        } else if (!entry.isIntersecting) {
          // Reset on exit so a repeat visit replays the demo.
          reset()
          setStarted(false)
        }
      },
      { threshold: 0.4 }
    )
    io.observe(root)

    return () => {
      io.disconnect()
      clearAll()
    }
    // `started` intentionally omitted: re-running on every state flip would
    // tear down and recreate the observer mid-animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, reset, clearAll])

  return (
    <div ref={rootRef} className="card-hairline w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-hairline bg-carbon-raised px-4 py-3">
        <div className="relative">
          <div className="grid size-9 place-items-center rounded-full bg-volt text-sm font-semibold text-void">
            K
          </div>
          <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-carbon-raised bg-volt" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">Kairven Studio</p>
          <p className="text-[11px] text-muted">
            {typing ? "typing…" : "online · replies in seconds"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            reset()
            play()
          }}
          className="rounded-full p-2 text-muted transition-colors hover:bg-white/5 hover:text-primary"
          aria-label="Replay conversation"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Thread */}
      <div
        className="flex min-h-[320px] flex-col justify-end gap-2 bg-[#0b0b0e] p-4"
        aria-live="polite"
        aria-label="Simulated WhatsApp conversation"
      >
        {SCRIPT.slice(0, visible).map((msg, i) => (
          <div
            key={i}
            className={cn(
              "chat-bubble max-w-[82%] px-3 py-2 text-[13px] leading-snug",
              msg.from === "customer"
                ? "self-start rounded-2xl rounded-bl-sm bg-carbon-raised text-primary"
                : "self-end rounded-2xl rounded-br-sm bg-[#144d37] text-[#e9fff4]"
            )}
          >
            {msg.text}
            <span className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-50">
              {["10:24", "10:24", "10:25", "10:25"][i]}
              {msg.from === "kairven" &&
                (i === SCRIPT.length - 1 ? (
                  <CheckCheck className="size-3 text-volt" />
                ) : (
                  <Check className="size-3" />
                ))}
            </span>
          </div>
        ))}

        {typing && (
          <div className="self-end rounded-2xl rounded-br-sm bg-[#144d37]/70 px-3 py-2.5">
            <span className="typing-dots flex gap-1">
              <i /> <i /> <i />
            </span>
          </div>
        )}
      </div>

      <p className="border-t border-hairline px-4 py-2 font-mono text-[10px] text-muted">
        Scripted demo · no live API
      </p>
    </div>
  )
}
