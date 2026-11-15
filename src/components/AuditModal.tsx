import * as Dialog from '@radix-ui/react-dialog'
import {useEffect, useRef, useState} from 'react'
import {ArrowUpRight, Loader2, Lock, X} from 'lucide-react'
import {useAppStore} from '@/lib/store'
import {requestAuditRoute, type AuditPayload} from '@/lib/auditRequest'
import {startScroll, stopScroll} from '@/lib/smoothScroll'
import {cn} from '@/lib/cn'
import {MagneticButton} from './ui/MagneticButton'

type Status = 'idle' | 'sending' | 'done' | 'error'

const PAIN_POINTS = [
  'Leads go cold before we reply',
  'After-hours enquiries vanish',
  'No idea where bookings come from',
  'Front desk is drowning in WhatsApp',
  'We’re invisible on Google',
  'Something else',
]

/**
 * 4d — diagnostic modal.
 *
 * The user never sees a phone number. The form posts to
 * /api/route-to-whatsapp, which reads KAIRVEN_WHATSAPP_NUMBER from the server
 * environment and returns a wa.me deep link. Nothing scrapeable ships in the
 * bundle, and rotating the number is a secret update, not a redeploy.
 */
export function AuditModal() {
  const open = useAppStore((s) => s.auditOpen)
  const closeAudit = useAppStore((s) => s.closeAudit)
  const form = useAppStore((s) => s.form)
  const setForm = useAppStore((s) => s.setForm)
  const resetForm = useAppStore((s) => s.resetForm)

  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [redirect, setRedirect] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const firstFieldRef = useRef<HTMLInputElement | null>(null)

  // Freeze Lenis + native scroll while the dialog owns the viewport.
  useEffect(() => {
    if (open) {
      stopScroll()
      const t = window.setTimeout(() => firstFieldRef.current?.focus(), 120)
      return () => window.clearTimeout(t)
    }
    startScroll()
    return undefined
  }, [open])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const onOpenChange = (next: boolean) => {
    if (!next) {
      closeAudit()
      // Keep the filled form on close, but clear the transient status.
      setStatus('idle')
      setError(null)
      setRedirect(null)
    }
  }

  const valid =
    form.name.trim().length > 1 &&
    form.business.trim().length > 1 &&
    form.painPoint.trim().length > 2

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || status === 'sending') return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('sending')
    setError(null)

    const payload: AuditPayload = {
      name: form.name.trim(),
      business: form.business.trim(),
      painPoint: form.painPoint.trim(),
    }

    const result = await requestAuditRoute(payload, controller.signal)

    if (result.ok) {
      setRedirect(result.redirect)
      setStatus('done')
      // Give the success state a beat before handing off to WhatsApp.
      window.setTimeout(() => {
        window.open(result.redirect, '_blank', 'noopener,noreferrer')
      }, 700)
    } else {
      setError(result.message)
      setStatus('error')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-[#050507]/80 backdrop-blur-md data-[state=open]:animate-[fadeIn_240ms_ease-out]" />
        <Dialog.Content
          className={cn(
            'glass-panel fixed top-1/2 left-1/2 z-[71] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2',
            'rounded-[var(--radius-panel)] p-6 shadow-[0_50px_140px_-40px_rgba(0,0,0,0.95)] md:p-8',
            'data-[state=open]:animate-[modalIn_320ms_cubic-bezier(0.16,1,0.3,1)]',
          )}
          aria-describedby="audit-desc"
        >
          <Dialog.Close
            className="absolute top-5 right-5 flex size-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-white/[0.06] hover:text-text-primary"
            aria-label="Close"
          >
            <X className="size-4" />
          </Dialog.Close>

          {status === 'done' && redirect ? (
            <div className="py-4">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-volt/12">
                <ArrowUpRight className="size-5 text-volt" strokeWidth={2.4} />
              </div>
              <h2 className="mt-6 text-center text-[1.35rem] font-medium tracking-[-0.025em] text-text-primary">
                Handing you over to WhatsApp
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-center text-[0.88rem] leading-relaxed text-text-muted">
                Your audit request for <span className="text-text-primary">{form.business}</span>{' '}
                is ready to send. If the tab didn’t open, use the button below.
              </p>

              <a
                href={redirect}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-volt mt-7 flex w-full items-center justify-center px-5 py-3.5 text-[0.88rem]"
              >
                Open WhatsApp
                <ArrowUpRight className="ml-1.5 size-4" strokeWidth={2.5} />
              </a>

              <button
                onClick={() => {
                  setStatus('idle')
                  resetForm()
                }}
                className="mt-3 w-full py-2 font-mono text-[0.7rem] tracking-[0.06em] text-text-muted uppercase transition-colors hover:text-text-primary"
              >
                Send another
              </button>
            </div>
          ) : (
            <>
              <span className="telemetry-tag">Free diagnostic</span>
              <Dialog.Title className="mt-3 text-[1.4rem] font-medium tracking-[-0.03em] text-text-primary">
                Where is the leak?
              </Dialog.Title>
              <Dialog.Description
                id="audit-desc"
                className="mt-2 max-w-sm text-[0.86rem] leading-relaxed text-text-muted"
              >
                Three fields. You’ll get a written audit of your capture, response and follow-up
                path — and the two changes that would recover the most bookings.
              </Dialog.Description>

              <form onSubmit={submit} className="mt-7 space-y-4">
                <Field label="Your name" htmlFor="audit-name">
                  <input
                    ref={firstFieldRef}
                    id="audit-name"
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={80}
                    value={form.name}
                    onChange={(e) => setForm({name: e.target.value})}
                    className={inputCls}
                    placeholder="Sameer Khan"
                  />
                </Field>

                <Field label="Business" htmlFor="audit-business">
                  <input
                    id="audit-business"
                    name="business"
                    autoComplete="organization"
                    required
                    maxLength={120}
                    value={form.business}
                    onChange={(e) => setForm({business: e.target.value})}
                    className={inputCls}
                    placeholder="Meridian Dental, Kanpur"
                  />
                </Field>

                <Field label="Biggest leak" htmlFor="audit-pain">
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {PAIN_POINTS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm({painPoint: p})}
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors duration-300',
                          form.painPoint === p
                            ? 'border-volt/40 bg-volt/10 text-volt'
                            : 'border-white/[0.08] text-text-muted hover:border-white/20 hover:text-text-primary',
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <textarea
                    id="audit-pain"
                    name="painPoint"
                    required
                    rows={3}
                    maxLength={600}
                    value={form.painPoint}
                    onChange={(e) => setForm({painPoint: e.target.value})}
                    className={cn(inputCls, 'resize-none')}
                    placeholder="We lose most enquiries after 7pm and never follow up."
                  />
                </Field>

                {status === 'error' && error && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-500/25 bg-red-500/[0.07] px-3 py-2 text-[0.78rem] text-red-300"
                  >
                    {error}
                  </p>
                )}

                <MagneticButton
                  type="submit"
                  disabled={!valid || status === 'sending'}
                  className={cn(
                    'btn-volt w-full px-5 py-3.5 text-[0.9rem]',
                    (!valid || status === 'sending') &&
                      'cursor-not-allowed opacity-40 shadow-none hover:shadow-none',
                  )}
                  strength={0.1}
                >
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Routing…
                    </>
                  ) : (
                    <>
                      Send the audit request
                      <ArrowUpRight className="ml-1.5 size-4" strokeWidth={2.5} />
                    </>
                  )}
                </MagneticButton>

                <p className="flex items-start gap-1.5 pt-1 font-mono text-[0.62rem] leading-relaxed tracking-[0.03em] text-text-muted/60">
                  <Lock className="mt-px size-3 shrink-0" />
                  Routed server-side — our number never appears in this page’s source.
                </p>
              </form>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const inputCls =
  'w-full rounded-xl border border-white/[0.09] bg-white/[0.025] px-3.5 py-2.5 text-[0.88rem] text-text-primary placeholder:text-text-muted/45 transition-colors duration-300 focus:border-volt/45 focus:bg-white/[0.04] focus:outline-none'

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mono-label mb-1.5 block text-[0.62rem]">
        {label}
      </label>
      {children}
    </div>
  )
}
