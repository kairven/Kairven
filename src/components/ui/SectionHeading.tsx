import type {ReactNode} from 'react'
import {cn} from '@/lib/cn'
import {Reveal} from './Reveal'

type Props = {
  index: string
  label: string
  title: ReactNode
  lede?: ReactNode
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({index, label, title, lede, align = 'left', className}: Props) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      <Reveal>
        <div
          className={cn(
            'flex items-center gap-3',
            align === 'center' && 'justify-center',
          )}
        >
          <span className="telemetry-tag">{index}</span>
          <span className="h-px w-8 bg-[var(--gold-telemetry)]/40" />
          <span className="mono-label text-text-primary/70">{label}</span>
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <h2 className="mt-5 text-headline text-text-primary">{title}</h2>
      </Reveal>

      {lede && (
        <Reveal delay={0.12}>
          <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-text-muted">{lede}</p>
        </Reveal>
      )}
    </div>
  )
}
