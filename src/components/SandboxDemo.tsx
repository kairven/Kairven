import {useCallback, useEffect, useRef, useState} from 'react'
import {Check, CheckCheck, Play, RotateCcw, ShieldCheck} from 'lucide-react'
import {CHAT_SCRIPT} from '@/data/content'
import {SectionHeading} from './ui/SectionHeading'
import {Reveal} from './ui/Reveal'
import {useAppStore} from '@/lib/store'
import {cn} from '@/lib/cn'
import {useSectionReveal} from '@/lib/useSectionReveal'

type Msg = (typeof CHAT_SCRIPT)[number]

/**
 * 4b — WhatsApp auto-reply sandbox.
 *
 * This is a scripted, deterministic replay: a pre-written message array
 * revealed on a timer. It is deliberately NOT wired to a live API. A real
 * WhatsApp sandbox on a public marketing page is an abuse and support
 * liability with zero added conversion — the illusion of a live thread is
 * what sells it, and an illusion is cheap, safe and offline-capable.
 */
export function SandboxDemo() {
  const openAudit = useAppStore((s) => s.openAudit)
  const revealRef = useSectionReveal()
  const [visibleCount, setVisibleCount] = useState(0)
  const [typing, setTyping] = useState(false)
  const timers = useRef<number[]>([])
  const threadRef = useRef<HTMLDivElement | null>(null)
  const sectionRef = useRef<HTMLDivElement | null>(null)

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])

  const play = useCallback(() => {
    clearTimers()
    setVisibleCount(0)

    let elapsed = 0
    CHAT_SCRIPT.forEach((msg, i) => {
      // Show "typing…" for the bot 900ms before its bubble lands.
      if (msg.from === 'kairven' && msg.delay > 300) {
        const tTyping = window.setTimeout(() => setTyping(true), elapsed + msg.delay - 900)
        timers.current.push(tTyping)
      }
      elapsed += msg.delay
      const t = window.setTimeout(() => {
        setTyping(false)
        setVisibleCount(i + 1)
      }, elapsed)
      timers.current.push(t)
    })
  }, [clearTimers])

  // Play once when the panel first enters the viewport. Re-entering restarts,
  // but only after the thread has left view long enough to feel intentional.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    let hasPlayed = false

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed) {
          hasPlayed = true
          play()
        }
      },
      {threshold: 0.4},
    )
    io.observe(el)
    return () => {
      io.disconnect()
      clearTimers()
    }
  }, [play, clearTimers])

  useEffect(() => {
    // Keep the newest bubble in view inside the fixed-height thread.
    const el = threadRef.current
    if (!el) return
    el.scrollTo({top: el.scrollHeight, behavior: 'smooth'})
  }, [visibleCount, typing])

  const restart = () => {
    clearTimers()
    setVisibleCount(0)
    setTyping(false)
    window.setTimeout(play, 220)
  }

  return (
    <section
      ref={revealRef}
      id="sandbox"
      className="relative scroll-mt-20 overflow-hidden py-24 md:py-32"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        aria-hidden="true"
      />
      <div className="shell">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_minmax(0,420px)] lg:gap-16">
          <div>
            <SectionHeading
              index="02"
              label="Live sandbox"
              title={
                <>
                  This is what happens at{' '}
                  <span className="whitespace-nowrap font-mono text-[0.78em] text-gold">
                    11:47 PM
                  </span>
                  .
                </>
              }
              lede="A real enquiry, a real conversation shape, answered in seconds — while the front desk is closed. Press play and watch the thread resolve into a confirmed booking."
            />

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {[
                {t: 'No app to install', d: 'Customers stay in WhatsApp. Nothing changes for them.'},
                {t: 'Live availability', d: 'Slots come from your calendar, not a static list.'},
                {t: 'Human handoff', d: 'Low confidence routes to staff with full context.'},
                {t: 'Every step logged', d: 'Source, transcript and booking land in one ledger.'},
              ].map((f, i) => (
                <Reveal key={f.t} delay={i * 0.05}>
                  <div className="flex gap-2.5">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-volt/70" strokeWidth={1.8} />
                    <div>
                      <p className="text-[0.86rem] font-medium text-text-primary">{f.t}</p>
                      <p className="mt-1 text-[0.8rem] leading-relaxed text-text-muted">{f.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.15}>
              <p className="mt-8 max-w-md border-l border-white/10 pl-4 font-mono text-[0.72rem] leading-relaxed text-text-muted/80">
                Scripted replay — no live WhatsApp connection runs on this page. The production
                system uses the official Cloud API with signed webhooks.
              </p>
            </Reveal>
          </div>

          {/* Phone */}
          <Reveal delay={0.1} className="mx-auto w-full max-w-[420px]">
            <div ref={sectionRef} className="relative">
              <div
                className="absolute -inset-8 -z-10 rounded-[48px] bg-[radial-gradient(closest-side,rgba(212,255,0,0.10),transparent)] blur-2xl"
                aria-hidden="true"
              />
              <div className="glass-panel overflow-hidden rounded-[30px] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
                {/* Chat header */}
                <div className="flex items-center gap-3 border-b border-white/[0.07] bg-[#0b141a]/70 px-4 py-3.5">
                  <div className="relative flex size-9 items-center justify-center rounded-full bg-volt/12 font-mono text-[0.7rem] font-semibold text-volt">
                    K
                    <span className="absolute -right-0 -bottom-0 size-2.5 rounded-full border-2 border-[#0b141a] bg-[#25D366]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.86rem] font-medium text-text-primary">
                      Meridian Dental · Front desk
                    </p>
                    <p className="text-[0.68rem] text-text-muted">
                      {typing ? 'typing…' : 'online · replies instantly'}
                    </p>
                  </div>
                  <span className="telemetry-tag">AI</span>
                </div>

                {/* Thread */}
                <div
                  ref={threadRef}
                  className="no-scrollbar flex h-[336px] flex-col gap-2 overflow-y-auto px-3.5 py-4"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 20% 10%, rgba(212,255,0,0.03), transparent 55%)',
                  }}
                  aria-live="polite"
                  aria-atomic="false"
                >
                  <div className="mb-1 self-center rounded-full bg-white/[0.04] px-2.5 py-1 font-mono text-[0.6rem] tracking-wide text-text-muted">
                    TODAY · 11:47 PM
                  </div>

                  {CHAT_SCRIPT.slice(0, visibleCount).map((msg: Msg, i) => (
                    <Bubble key={i} msg={msg} index={i} />
                  ))}

                  {typing && (
                    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm bg-[#1f2c33] px-3 py-2.5">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="size-1.5 animate-bounce rounded-full bg-white/45"
                          style={{animationDelay: `${d * 120}ms`, animationDuration: '900ms'}}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer / controls */}
                <div className="border-t border-white/[0.07] bg-[#0b141a]/60 px-3.5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-[0.76rem] text-text-muted/70">
                      Message
                    </div>
                    <button
                      onClick={restart}
                      className="flex items-center gap-1.5 rounded-full bg-volt px-3.5 py-2 text-[0.74rem] font-semibold text-[#07080a] transition-transform active:scale-95"
                      aria-label="Replay the conversation"
                    >
                      {visibleCount === 0 ? (
                        <>
                          <Play className="size-3" strokeWidth={3} /> Play
                        </>
                      ) : (
                        <>
                          <RotateCcw className="size-3" strokeWidth={3} /> Replay
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-center font-mono text-[0.6rem] tracking-wide text-text-muted/50">
                    SIMULATED THREAD · NO LIVE API
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.07] bg-carbon/60 px-3.5 py-2.5">
                <div>
                  <p className="font-mono text-[0.62rem] tracking-[0.1em] text-text-muted uppercase">
                    Time to booking
                  </p>
                  <p className="mt-0.5 text-[0.85rem] font-medium text-text-primary">
                    {visibleCount >= CHAT_SCRIPT.length ? '4.2 seconds' : '—'}
                  </p>
                </div>
                <button
                  onClick={() => openAudit('sandbox')}
                  className="btn-ghost px-3 py-1.5 text-[0.74rem]"
                >
                  Get this for my business
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Bubble({msg, index}: {msg: Msg; index: number}) {
  const mine = msg.from === 'kairven'
  return (
    <div
      className={cn(
        'max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[0.83rem] leading-relaxed shadow-sm',
        'animate-[bubble_320ms_cubic-bezier(0.16,1,0.3,1)_both]',
        mine
          ? 'self-end rounded-br-sm bg-[#144d37] text-[#e7f6ee]'
          : 'self-start rounded-bl-sm bg-[#1f2c33] text-[#eef2f4]',
      )}
      style={{animationDelay: '0ms'}}
    >
      <span className="sr-only">{mine ? 'Kairven: ' : 'Customer: '}</span>
      {msg.text}
      <span className="mt-1 flex items-center justify-end gap-1 font-mono text-[0.56rem] text-white/35">
        11:{47 + Math.floor(index / 2)}
        {mine ? (
          index >= 3 ? (
            <CheckCheck className="size-3 text-[#53bdeb]" />
          ) : (
            <Check className="size-3" />
          )
        ) : null}
      </span>
    </div>
  )
}
